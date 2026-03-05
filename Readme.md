Documentación Técnica: Morro Sur Logística v1.0
# Descripción General
Morro Sur es una Single Page Application (SPA) diseñada para eliminar intermediarios en la cadena de suministro pesquera. La plataforma permite a los pescadores registrar sus capturas en tiempo real y a los restaurantes adquirirlas directamente mediante un mercado digital.
# Arquitectura de Software
La aplicación sigue un modelo de Arquitectura en Capas Front-end con persistencia de datos en el lado del cliente.

- Capa de Presentación (HTML5/CSS3): Estructura semántica y diseño responsivo basado en Flexbox y Grid.
- Capa de Lógica (JavaScript ES6+): Motor de renderizado dinámico y gestión de estados.
- Capa de Datos (Web Storage API): Persistencia local mediante localStorage.
# Especificaciones de Componentes
## Gestión de Estado (Variables Globales)
- **localProducts**: Arreglo de objetos que representa la base de datos de productos.
- **cart**: Arreglo de objetos que almacena los productos seleccionados por el restaurante.
- **userRole** / **userFirstName**: Variables almacenadas en localStorage para el control de sesiones.
## Funciones de Navegación (showSection)
Controla la visibilidad de los contenedores <*section*> mediante la manipulación de la clase .*hidden*. Cada vez que se cambia de sección, se ejecutan funciones de "limpieza" o "re-renderizado" para asegurar que la información esté actualizada.
# Flujos de Datos (CRUD)
Flujo del Pescador (Escritura)

1. El usuario completa el formulario **product-form**.
1. Si se incluye una imagen, se procesa mediante el objeto **FileReader** para convertirla en una cadena **Base64** (permitiendo su almacenamiento en localStorage).
1. La función **saveProduct** determina si es una nueva entrada (**push**) o una edición (**update**) basándose en el valor de edit-**index**.
1. Se dispara la sincronización mediante **renderRestauranteMarket**().

Flujo del Restaurante (Lectura y Compra)

1. **renderRestauranteMarket** itera sobre **localProducts** y genera tarjetas dinámicas.
1. **addToCart** valida el stock disponible y añade el ítem al arreglo **cart**.
1. **renderCart** calcula subtotales y totales mediante el método .**reduce**().
# Control de Acceso y Seguridad Local
Aunque la aplicación es de cliente, se implementan validaciones de seguridad lógica en la función **checkAuth(viewId):**

|**Rol detectado**|**Permiso a pescadores-view**|**Permiso a restaurantes-view**|
| :- | :- | :- |
|pescador|**Permitido**|Denegado|
|restaurante|Denegado|**Permitido**|
|null (Anónimo)|Denegado|Denegado|

Diccionario de Datos (Modelo de Producto)

Cada objeto dentro del array de productos sigue esta estructura:

*JSON*

*{*

`  `*"id": "Number (Timestamp)",*

`  `*"name": "String",*

`  `*"price": "Number (Float)",*

`  `*"stock": "Number (Int)",*

`  `*"desc": "String",*

`  `*"img": "String (Base64 / URL)",*

`  `*"owner": "String (Nombre del pescador)"*

*}*
# Mantenimiento y Escalabilidad
Para migrar esta aplicación a un entorno de producción real, se recomiendan los siguientes cambios:

1. **Base de Datos:** Sustituir localStorage por una base de datos NoSQL (Firebase) o SQL (PostgreSQL).
1. **Imágenes:** Implementar un servicio de almacenamiento en la nube (Cloudinary o AWS S3) en lugar de cadenas Base64.
1. **Auth:** Implementar JWT (JSON Web Tokens) para una autenticación segura en el servidor.

