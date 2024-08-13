# Use a imagem base do Node.js
FROM node:18

# Crie e defina o diretório de trabalho
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instale as dependências da aplicação
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta na qual a aplicação será executada
EXPOSE 3000

# Defina o comando para iniciar a aplicação
CMD [ "npm", "run", "dev" ]
