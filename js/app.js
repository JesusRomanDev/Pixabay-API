const resultado = document.querySelector('#resultado');
const formulario = document.querySelector('#formulario');
const registrosPorPagina = 40; //cuantos registros/imagenes quieres mostrar por pagina
const paginacionDiv = document.querySelector('#paginacion');
let totalPaginas; //ira cambiando cada vez que hagamos una consulta
let iterador; //va a iniciar sin ningun valor
let paginaActual = 1; //la primera vez que se abre estaremos en la pagina 1, cuando se consulte por primera vez en la API, esta sera la pagina

window.onload = ()=>{
    formulario.addEventListener('submit', validarFormulario);
}

function validarFormulario(e){
    e.preventDefault();

    const terminoBusqueda = document.querySelector('#termino').value.trim();
    console.log(terminoBusqueda);

    if(terminoBusqueda === ''){
        mostrarAlerta('Agrega un termino de busqueda');
        return; //no me ejecutes las siguientes lineas
    }
    //Pero si si hay algo ejecutame esta funcion
    buscarImagenes(terminoBusqueda);
}

function mostrarAlerta(mensaje){
    //Evitar que se muestre la alerta multiples veces
    const existeAlerta = document.querySelector('.bg-red-100');
    if(!existeAlerta){ //si no existe la alerta con esa clase, creame lo siguiente
        const alerta = document.createElement('p');
        alerta.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center');
        alerta.innerHTML = `
        <strong class='font-bold'>Error!</strong>
        <span class="block sm:inline">${mensaje}</span>
        `;

        formulario.appendChild(alerta);
        setTimeout(()=>{
            alerta.remove();
        },3000)
    }
}

function buscarImagenes(){
    const termino = document.querySelector('#termino').value; // <--- esto es para que funcione la paginacion, en vez de en la 
    //url terminoBusqueda, poner esta variable y en el parametro de esta funcion tiene que ir vacio, lo mismo en donde se llama
    //linea 44 y 23
    const key = '36665675-9e69f9dd604b54372dd7e4230';
    //Editamos esta URL con Template Strings https://pixabay.com/api/?key=36665675-9e69f9dd604b54372dd7e4230&q=yellow+flowers&image_type=photo
    const url = `https://pixabay.com/api/?key=${key}&q=${termino}&per_page=${registrosPorPagina}&page=${paginaActual}`;

    //hits: cuantas quieres mostrar por pagina
    //total: cuantas imagenes en total en toda la base de datos hay
    //totalHits: cuantas te pueden prestar/ puedes acceder
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => {
            totalPaginas = calcularPaginas(resultado.totalHits); //va cambiando de acuerdo a la busqueda que tengamos
            console.log(totalPaginas);
            mostrarImagenes(resultado.hits);
            
        });
}

//La funcion recibira un array
function mostrarImagenes(imagenes){
    //Limpiando el HTML
    while(resultado.firstChild){
        resultado.removeChild(resultado.firstChild);
    }
    console.log(imagenes);

    //Iterar sobre el arreglo de imagenes y construir el HTML
    imagenes.forEach(imagen => {
        const {previewURL, likes, views, largeImageURL} = imagen;

        // const nuevo = document.createElement('div')
        //nuevo.innerHTML = ``
        //el operador ADICION, por cada vuelta de ciclo añadira el bloque de codigo a cada imagen que se ejecuta
        //aqui usamos directamente el contenedor resultado, sin intermediarios para mas abajo no usar appendChild 
        resultado.innerHTML += `
        <div class="card w-1/2 md: w-1/3 lg:w-1/4 p-3 mb-4">
            <div class="bg-white card__container">
                <img class="w-full card__img" src="${previewURL}">

                <div class="p-4">
                    <p class="font-bold text-white">${likes} <span class="font-light"> Likes </span></p>
                    <p class="font-bold text-white">${views} <span class="font-light"> Vistas </span></p>

                    <a class="card__link block w-full bg-blue-800 hover:bg-blue-500 font-bold text-center rounded mt-5 p-1" 
                    href="${largeImageURL}" target="_blank" rel="noopener noreferrer">
                        Ver Imagen
                    </a>
                </div>
            </div>
        </div>
        `
        // resultado.appendChild(nuevo) codigo si hubieramos creado un div
        //NOTA: es un modo de hacerlo mas sencillo ya que solo agregamos el operador ADICION y nos ahorramos codigo
        //en las lineas 75,75 y 96
    });

    //Limpiar el paginador Previo
    //Esto es porque si volvemos a buscar, al momento de irnos hacia abajo a ver los paginadores, se agrega la nueva busqueda, ejemplo
    //Primera vez buscando tenemos paginas del 1 al 5, Segunda vez buscando tenemos del 1 al 19, pero si vemos bien en los paginadores
    //tendremos 1-5,1-19
    while(paginacionDiv.firstChild){
        paginacionDiv.removeChild(paginacionDiv.firstChild);
    }
    //Generamos el (nuevo) HTML
    imprimirPaginador();
    //Vamonos hacia arriba cuando cambiamos de pagina
    window.scrollTo(0,0);
}

function calcularPaginas(total){
    //Lo que hace esta funcion es, el total de imagenes recibidas, entre los registros por pagina que queremos, en este caso 40
    //dividirlo y que el resultado sean la cantidad de paginas que tendremos en nuestro HTML
    return parseInt(Math.ceil(total/registrosPorPagina));
    //total de imagenes que hay / la cantidad de imagenes por pagina que queremos mostrar
    //total(totalHits) va a variar / registrosPorPagina siempre va a ser 40
    //retorname este valor a la funcion
}

//Entonces una forma sencilla de calcular la cantidad de paginas y registrar e ir iterando hasta llegar al final, una buena opcion
//es con esto, UN GENERADOR
function imprimirPaginador(){
    iterador = crearPaginador(totalPaginas);
    
    while(true){ //esto se va a ejecutar todo el tiempo, ya que mientras true sea true pues se va a ejecutar siempre esta linea
        const {value, done} = iterador.next(); //next tiene 2 valores, value y done, podemos hacer destructuring con el
        if(done) return; //Si ya llegamos al final, no ejecutes nada mas

        //Caso contrario, genera un boton por cada elemento en el generador(si son 13, pues 13 veces se ejecuta todo este codigo de abajo)
        const boton = document.createElement('button');
        boton.href="#"; //no va a llevar a ningun lado
        boton.dataset.pagina = value; //se crea como atributo en el boton data-pagina=${value} ira aumentando de uno en uno por el generador
        //Osease el value va del 1 hasta n cantidad de numeros
        boton.textContent = value; //1,2,3,4 y asi debido al generador
        boton.classList.add('siguiente', 'bg-yellow-200', 'px-4', 'py1', 'mr-2', 'font-bold', 'mb-3', 'uppercase', 'rounded', 'mt-10');
        console.log(boton);

        boton.onclick = function(){
            console.log(value); //cuando damos click en algun boton de la paginacion nos dira en que pagina estamos por el dataset
            paginaActual = value; //cambiara nuestro valor de paginaActual
            console.log(paginaActual);
            //Volvemos a consultar la API
            buscarImagenes();

        }

        paginacionDiv.appendChild(boton);
    }
}


//Generador que va a registrar la cantidad de elementos de acuerdo a las paginas
function *crearPaginador(total){
    //Digamos que el total son 13 paginas, entonces este for se recorrera 13 veces
    for(let i =1; i <=total ;i++){
        console.log(i);
        yield i;
    }
}