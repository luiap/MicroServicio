# Usamos nginx para servir archivos estáticos
FROM nginx:alpine

# Copia tus archivos web al servidor nginx
COPY . /usr/share/nginx/html

# Expone el puerto 80 para acceder desde el navegador
EXPOSE 80

# Inicia el servidor web
CMD ["nginx", "-g", "daemon off;"]
