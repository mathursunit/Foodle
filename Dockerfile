FROM nginx:stable-alpine

# Copy static site files
COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY script.js /usr/share/nginx/html/script.js
COPY words.txt /usr/share/nginx/html/words.txt
COPY logo.png /usr/share/nginx/html/logo.png

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
