# Testar o build do ED - CLINICARE

Este pacote contém o aplicativo compilado. Para modificar o projeto, use os arquivos de origem do repositório.

1. Extraia o ZIP completo, mantendo a pasta `ED---CLINICARE-`.
2. Na pasta que contém `ED---CLINICARE-`, inicie um servidor estático. Se tiver Python 3, execute:

   ```sh
   python3 -m http.server 8080
   ```

   No Windows, o comando pode ser `py -m http.server 8080`.

3. Abra `http://localhost:8080/ED---CLINICARE-/`.
4. Aguarde a indicação de prontidão offline antes de desligar a rede e recarregar.

Não abra `index.html` diretamente pelo explorador de arquivos: módulos JavaScript e service worker precisam de HTTP/HTTPS. Para acesso por celular e instalação fora de localhost, use hospedagem HTTPS, como GitHub Pages após revisão.

Os cálculos e exames são educacionais e ainda dependem de validação clínica e homologação institucional. Não inclua dados identificáveis de pacientes em capturas ou arquivos compartilhados.
