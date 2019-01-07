FROM node:alpine

COPY . /bot

WORKDIR /bot
RUN yarn install && ls -l
RUN crontab -l | { cat; echo "0 0 * * * cd /bot && node request.js"; } | crontab - 
    
CMD [ "node", "main.js" ]