FROM nginx:alpine-slim

# نسخ جميع ملفات الفرونت إند مباشرة إلى خادم Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]