// El import dinámico es obligatorio con Module Federation: el runtime de
// federación necesita negociar las versiones de los módulos compartidos
// (React, ReactDOM, react-router-dom) antes de que se ejecute cualquier
// código de la aplicación que dependa de ellos.
import('./bootstrap');
