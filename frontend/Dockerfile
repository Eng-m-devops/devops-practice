FROM nginx:alpine-slim

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy explicit frontend web application assets
COPY index.html style.css /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]