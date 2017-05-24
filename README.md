# Matcha

Matcha is a 42 project where we must create a dating website.
I used the MEAN stack on a distant server, with debian, nginx and docker,
with an open API for the web server.

To run it, you first need to setup a nginx server, then [install docker!](https://docs.docker.com/engine/installation/linux/debian/#install-using-the-repository)

Create your mongo superuser in `docker/mongo/init.sh`,
you may also want to replace our IP `46.101.7.5` with yours, or localhost.

delete all previous images if needed :
`docker rm $(docker ps -a -q)
docker rmi $(docker images -q)`

then, just run
`docker-compose up --build`
it takes quite long without the docker images, but you need to to it only once. once done,
Your mongo database is created, kill the process with ctrl+c and launch it:

`docker-compose up`
