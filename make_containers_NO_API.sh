#!/bin/bash
# if you don't want to use docker api, useful for testing
# not normally included in version control
docker run -d --name mysql-server-visual-survey -p 3306:3306 \
	-e "MYSQL_RANDOM_ROOT_PASSWORD=yes" \
	-e "MYSQL_DATABASE=visualsurvey" \
	-e "MYSQL_USER=visualsurvey" \
	-e "MYSQL_PASSWORD=password" \
	mysql