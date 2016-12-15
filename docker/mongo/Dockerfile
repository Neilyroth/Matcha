FROM  mongo:latest

ADD init.sh /tmp/init.sh
RUN chmod 777 /tmp/init.sh

ADD user.sh /tmp/user.sh
RUN chmod 777 /tmp/user.sh

ENTRYPOINT ["/tmp/init.sh"]


EXPOSE 27017

CMD ["mongod"]