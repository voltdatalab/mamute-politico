Configuracao Ghost

- Visite https://meu-endereco-aqui.com/ghost/#/settings/code-injection
- Em code injection, clique em open, copie no `header` e cole o codigo abaixo:

```
<script>
(function () {
  if (window.location.pathname === "/" && !window.location.hash) {
    window.location.replace("/app/");
  }
})();
</script>
```

- Salve e volte para a pagina inicial https://meu-endereco-aqui.com