FROM node:alpine

COPY . /

WORKDIR /
RUN yarn install
RUN crontab -l | { cat; echo "0 0 * * * node /request.js"; } | crontab - 
    
ENTRYPOINT [ "node", "/main.js" ]
