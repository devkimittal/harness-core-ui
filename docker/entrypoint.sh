#!/bin/bash
# Copyright 2022 Harness Inc. All rights reserved.
# Use of this source code is governed by the PolyForm Shield 1.0.0 license
# that can be found in the licenses directory at the root of this repository, also available at
# https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.

NGINX_CONFIG_FILE="/etc/nginx/nginx.conf"

if [[ "$IPV4_ONLY" == "true" ]]
then
  NGINX_CONFIG_FILE="/etc/nginx/nginx-ipv4-only.conf"
fi

sed -i "s|<\!-- apiurl -->|<script>window.apiUrl = '$API_URL'</script>|" index.html
sed -i "s|HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|$HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|$HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|$HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_CDN_PLACEHOLDER|$HARNESS_ENABLE_CDN_PLACEHOLDER|" index.html
sed -i "s|<\!-- segmentToken -->|<script>window.segmentToken = '$SEGMENT_TOKEN'</script>|" index.html
sed -i "s|<\!-- bugsnagToken -->|<script>window.bugsnagToken = '$BUGSNAG_TOKEN'</script>|" index.html
sed -i "s|<\!-- appDyEUMToken -->|<script>window.appDyEUMToken = '$APPDY_EUM_TOKEN'</script>|" index.html
sed -i "s|<\!-- deploymentType -->|<script>window.deploymentType = '$DEPLOYMENT_TYPE'</script>|" index.html
sed -i "s|<\!-- refinerProjectToken -->|<script>window.refinerProjectToken = '$REFINER_PROJECT_TOKEN'</script>|" index.html
sed -i "s|<\!-- refinerFeedbackToken -->|<script>window.refinerFeedbackToken = '$REFINER_FEEDBACK_TOKEN'</script>|" index.html
if [ "$HARNESS_ENABLE_CDN_PLACEHOLDER" = "true" ]
then
  sed -i "s|\"static\/main\.\(.*\)\.js\"|\"//static.harness.io/ng-static/main.\1.js\"|" index.html
fi
echo "Using $NGINX_CONFIG_FILE for nginx"
nginx -c $NGINX_CONFIG_FILE -g 'daemon off;'
