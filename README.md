# Evaluador de Madurez AIOps para Redes

Aplicación web estática para evaluar escenarios de operación de red mediante niveles L0–L5, visualizar brechas y generar un roadmap automático.

## Funciones

- Evaluación independiente por escenario.
- Diez dimensiones de capacidad AIOps.
- Índice técnico ponderado y nivel seguro con compuertas.
- Radar de capacidades y comparación por escenario.
- Hallazgos, evidencia requerida y roadmap automático.
- Guardado local en el navegador.
- Importación y exportación JSON.
- Informe imprimible como PDF.
- Sin backend ni dependencias externas.

## Publicar en GitHub Pages

1. Cree un repositorio público en GitHub.
2. Copie **el contenido de la carpeta `dist/`** en la raíz del repositorio.
3. Confirme los archivos `index.html`, `styles.css`, `app.js` y `.nojekyll`.
4. En GitHub abra **Settings → Pages**.
5. En **Build and deployment**, seleccione **Deploy from a branch**.
6. Seleccione la rama `main` y la carpeta `/(root)`.
7. Guarde y espere a que GitHub muestre la URL publicada.

También puede publicar la carpeta `dist` mediante GitHub Actions si desea conservar la estructura completa del proyecto.

## Uso local

Abra `dist/index.html` directamente o ejecute un servidor HTTP:

```bash
python3 -m http.server 8080 --directory dist
```

Luego abra `http://localhost:8080`.

## Metodología

Adaptación educativa de:

- TM Forum Autonomous Networks Levels e IG1252.
- ETSI Zero-touch network and Service Management (ZSM).
- NIST AI Risk Management Framework.

No constituye una certificación oficial de estas organizaciones.
