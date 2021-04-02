# Rocket.Chat.App-Jitsi

Create Jitsi channels and links with a slash command.

# Deprecated

This project will no longer be maintained by me, I have retired my Rocket.Chat server in favor of a Matrix Synapse server.

## Configuration

TODO

## Docker
A Dockerfile and docker-compose are provided.

Build the docker image and run it to deploy to your server:
`docker build -t rocketchatapp_jitsi . && docker run -it --rm -e URL=YOUR_SERVER -e USERNAME=YOUR_USERNAME -e PASSWORD=YOUR_PASSWORD rocketchatapp_jitsi`

Build the docker image and run docker-compose to deploy to your server:
`docker build -t rocketchatapp_jitsi . && docker-compose run --rm -e URL=YOUR_SERVER -e USERNAME=YOUR_USERNAME -e PASSWORD=YOUR_PASSWORD rocketchatapp_jitsi`
