FROM node:alpine

COPY . /

RUN crontab -l | { cat; echo "0 0 * * * node /request.js"; } | crontab - 
    
ENTRYPOINT [ "node", "/main.js" ]
