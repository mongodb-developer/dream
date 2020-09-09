#!/usr/bin/env bash
realm-cli login --api-key ${ATLAS_PUBLIC_KEY} --private-api-key ${ATLAS_PRIVATE_KEY}
rm -rf ./realm
realm-cli export --app-id ${REALM_APPID} --for-source-control --include-dependencies --include-hosting -o ./realm
realm-cli logout

