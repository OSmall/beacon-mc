#!/bin/bash
set -u

function usage() {
	cat >&2 << EOF
Usage  : $0 DNS_FQDN DNS_TTL AWS_ZONE_ID RECHECK_SECS
Example: $0 test.example.com 5 Z148QEXAMPLE8V 30
EOF
	exit 1
}

function validate_ip() {
	[[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

[ "$#" -eq 4 ] || usage

DNS_FQDN="$1"; shift
DNS_TTL="$1"; shift
AWS_ZONE_ID="$1"; shift
REFRESH_TIME="$1"; shift

OLD_IP=""
TS=0

while [ 1 ] ; do
	sleep "${TS}s"
	TS="$REFRESH_TIME" # sleep can be adjusted on the fly

    OLD_IP="$(dig +short "$DNS_FQDN")"
	THIS_IP="$(curl -sS --max-time 5 https://api.ipify.org)"

    AWS_QUERY="$(aws ec2 describe-instances --profile mc --instance-ids <INSTANCE_ID> --query 'Reservations[0].Instances[0].[State.Name,PublicIpAddress]' --output text)"
    IFS=' ' read -r MC_STATUS MC_IP <<< $AWS_QUERY # split the query into the status and the IP

    if ! validate_ip "$OLD_IP" ; then
		echo "Invalid OLD_IP: $OLD_IP"
		continue
	fi
	if ! validate_ip "$THIS_IP" ; then
		echo "Invalid THIS_IP: $THIS_IP"
		continue
	fi
    
    if [ "$MC_STATUS" == "stopped" ] || [ "$MC_STATUS" == "stopping" ]; then
        if [ "$OLD_IP" == "$THIS_IP" ]; then
            echo "No IP change needed: $OLD_IP"
            continue
	    fi

        echo "Minecraft server is off. Changing to Beacon IP"
        NEW_IP=$THIS_IP

    elif [ "$MC_STATUS" == "running" ] || [ "$MC_STATUS" == "pending" ]; then
        if ! validate_ip "$MC_IP" ; then
            echo "Invalid MC_IP: $MC_IP"
            continue
        fi
        if [ "$OLD_IP" == "$MC_IP" ]; then
            echo "No IP change needed: $OLD_IP"
            continue
	    fi

        echo "Minecraft server is on. Changing to Minecraft IP"
        NEW_IP=$MC_IP
    fi

	# UPSERT: http://docs.aws.amazon.com/Route53/latest/APIReference/API_ChangeResourceRecordSets.html
	# http://stackoverflow.com/questions/1167746/how-to-assign-a-heredoc-value-to-a-variable-in-bash
    
	read -r -d '' JSON_CMD << EOF
	{
		"Comment": "DDNS update",
		"Changes": [
			{
				"Action": "UPSERT",
				"ResourceRecordSet": {
					"Name": "$DNS_FQDN.",
					"Type": "A",
					"TTL": $DNS_TTL,
					"ResourceRecords": [
						{
							"Value": "$NEW_IP"
						}
					]
				}
			}
		]
	}
EOF

	echo "Updating IP to: $NEW_IP ($DNS_FQDN); OLD=$OLD_IP"

	aws route53 change-resource-record-sets --profile ddns\
		--hosted-zone-id "$AWS_ZONE_ID" --change-batch "$JSON_CMD"

    TS=$DNS_TTL # increase sleep after changing the DNS record

	echo "Done. Request sent to update IP to: $NEW_IP ($DNS_FQDN)"
done
