let tablaCortado,tablaRollos;
let listaPreCortado = [];
const jwtToken = localStorage.getItem('jwtToken');
$(document).ready(function () {
    getListaCortados();
    getListaCortadores();
    getRollosDisponibles();

    // ASIGNAR ROLLOS A CORTADORES
    $("#tablaRollos tbody").on('click','button.addProductoRollo',function () {
        let dataProducto = tablaRollos.row( $(this).parents('tr') ).data();
        tablaRollos.row( $(this).parents('tr') ).remove().draw();
        agregarProducto(dataProducto);
		listaPreCortado.push(dataProducto);
		calcularTotalMetraje();
    }); 

	$('#contenedorAddRollo').on('keyup','input.cantAddMetraje', function(e) {
        e.preventDefault();
        calcularTotalMetraje();
    });

	$('#contenedorAddRollo').on('click','button.btnDeletePedido', function(e) {
        e.preventDefault();
		let parm = this.id.split('_');
        buscarProductoAddTabla(parm[1]);
        calcularTotalMetraje();
    });

	$('#formAddCortado').submit(function (e) { 
		e.preventDefault();
		let formData = $(this).serialize();
		$.ajax({
			type: "POST",
			url: "/api/cortado",
			data: formData,
			headers: {
				'Authorization': jwtToken
			},
			// dataType: "dataType",
			success: function (response) {
				console.log(response);
			}
		});
	});

	// ASIGNAR POR CORTADO
	$("#tablaCortado tbody").on('click','button.editCortado',function () {
        let dataProducto = tablaCortado.row( $(this).parents('tr') ).data();
		// console.log(dataProducto);
		$('#modalAgregarCorte').modal('show');
        $.ajax({
			type: "GET",
			url: "/api/cortadoRollo/"+dataProducto.id,
			headers: {
				'Authorization': jwtToken
			},
			dataType: "JSON",
			success: function (response) {
				$('#contenedorAddRollos').empty();
				let x = '';
				response.forEach(element => {
					x+= `<div class='row text-center'>
							<div class='col-3'>${element.codigo}</div>
							<div class='col-3'>${element.tela}</div>
							<div class='col-2'>${element.detalle}</div>
							<div class='col-2'>${element.dimension}</div>
							<div class='col-2'>${element.metraje}</div>
						</div>`;
				});
				$('#contenedorAddRollos').append(x);
			}
		});
    }); 

	$('#btnAgregarCortes').click(function (e) { 
		e.preventDefault();
		let fecha = new Date();
		let tiempo = fecha.getTime();
		$('#contAddRollosInput').append(`<div class='row no-gutters' id='filaAddCorte_${tiempo}'>
			<div class='col-2'><input type='text' class='form-control form-control-sm' name='codigoAddCorte_${tiempo}'></div>
			<div class='col-3'><input type='text' class='form-control form-control-sm' name='detalleAddCorte_${tiempo}'></div>
			<div class='col-2'><input type='text' class='form-control form-control-sm' name='tallasAddCorte_${tiempo}'></div>
			<div class='col-2'><input type='number' step='1' min='1' value='1' class='form-control form-control-sm' name='metrajeAddCorte_${tiempo}'></div>
			<div class='col-2'><input type='number' step='1' min='1' value='1' class='form-control form-control-sm' name='cantidadAddCorte_${tiempo}'></div>
			<div class='col-1 text-center'><button type='button' class='btnDeleteAddCorte btn btn-sm btn-danger' id='btnDeleteAddCorte_${tiempo}'><i class='far fa-window-close'></i></button></div>
		</div>`);
	});

	$("#contAddRollosInput").on('click','button.btnDeleteAddCorte',function () {
		let aux  = this.id.split('_');
		$('#filaAddCorte_'+aux[1]).remove();
    }); 

	$('#formCortesObtenido').submit(function (e) { 
		e.preventDefault();
		let formData = $(this).serialize();
		$.ajax({
			type: "POST",
			url: "/api/cortadosEntregados",
			data: formData,
			headers: {
				'Authorization': jwtToken
			},
			// dataType: "dataType",
			success: function (response) {
				console.log(response);
			}
		});
	});
});

function getListaCortados(){
    $('#tablaCortado').dataTable().fnDestroy();
	tablaCortado = $("#tablaCortado").DataTable({
		responsive: true,
		"order": [[ 0, "desc" ]],
		language: {
			sProcessing: "Procesando...",
			sLengthMenu: "Mostrar _MENU_ registros",
			sZeroRecords: "No se encontraron resultados",
			sEmptyTable: "Ninguno dato disponible en esta tabla",
			sInfo:
				"Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
			sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
			sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
			sInfoPostFix: "",
			sSearch: "Buscar:",
			sUrl: "",
			sInfoThousands: ",",
			sLoadingRecords: "Cargando...",
			oPaginate: {
				sFirst: "Primero",
				sLast: "Ultimo",
				sNext: "Siguiente",
				sPrevious: "Anterior",
			},
			oAria: {
				sSortAscending:
					": Activar para ordenar la columna de manera ascendente",
				sSortDescending:
					": Activar para ordenar la columna de manera descendente",
			},
			buttons: {
				copy: "Copiar",
				colvis: "Visibilidad",
			},
		},
		ajax: {
            type: "GET",
			url: "/api/cortado",
            headers: {
                "Authorization": `${jwtToken}`
            },
		},
		columns: [
            { data: "id", width: "5%" },
			{ data: "fecha", width: "16%" },
            { data: "empleado", width: "16%" },
            { data: "personal", width: "16%" },
			{ data: "metraje", width: "9%" },
            { data: "estimado", width: "9%" },
            { data: "entregado", width: "9%" },
			{ data: "estado_cortado",
				render: function (data) {
				  if (data == 'Entregado') {
					return `<h5><span class="badge badge-warning">${data}</span></h5>`;
					} else {
						if(data == 'Proceso'){
							return `<h5><span class="badge badge-info">${data}</span></h5>`;
						}else{
							return `<h5><span class="badge badge-success">${data}</span></h5>`;
						}
					}
				},width: "10%",
			},
			{ data: null,
				defaultContent:
				"<button type='button' class='editCortado btn btn-warning btn-sm'><i class='fas fa-edit'></i></button> "+
                "<button type='button' class='deletCortado btn btn-danger btn-sm' data-toggle='modal' data-target='#modalEliminarEmpleado'><i class='fas fa-trash'></i></button> ",
				width: "15%"
			}
		],
	});
}

// ASIGNAR ROOLOS A CORTADORES 
function agregarProducto(dataProducto){
	$("#contenedorAddRollo").append(`<div class='row my-1 no-gutters filaItem text-center' id='fila_${dataProducto.id}'>
		<div class='col-2'>${dataProducto.codigo}</div>
		<div class='col-3 text-center'><span>${dataProducto.tela}</span></div>
		<div class='col-2 text-center'><span>${dataProducto.detalle}</span></div>
		<div class='col-2 text-center'><span>${dataProducto.altura} X ${dataProducto.ancho}</span></div>
		<div class='col-2'><input type='number' value='1' min='0.1' step='0.01' max='${dataProducto.resto}' name='IdCant_${dataProducto.id}' id='IdCant_${dataProducto.id}' class='form-control form-control-sm p-1 cantAddMetraje' style='width:100%;'></div>
		<div class='col-1 text-center'><button type='button' class='btnDeletePedido btn btn-sm btn-danger' id='btnID_${dataProducto.id}'><i class='far fa-window-close'></i></button></div>
	`);
}

function getRollosDisponibles(){
    $('#tablaRollos').dataTable().fnDestroy();
	tablaRollos = $("#tablaRollos").DataTable({
		responsive: true,
        paging: false,
		"order": [[ 0, "desc" ]],
		ajax: {
			method: "GET",
			url: "/api/getRollosDisponibles",
		},
		columns: [
            { data: "codigo", width:"15%" },
			{ data: "tela", width: "20%" },
            { data: "tipo", width: "15%" },
            { data: "detalle", width: "15%" },
            { data: "altura", width: "10%" },
			{ data: "ancho", width: "10%" },
            { data: "resto", width: "10%" },
			{data: null,
                defaultContent:
                  "<button type='button' class='addProductoRollo btn btn-success btn-sm'><i class='fa fa-shopping-bag'></i></button>",
                width: "5%" 
            }
		]
	});
}

function calcularTotalMetraje(){
	let metraje = 0;
	$(".cantAddMetraje").each(function() {
		metraje += parseFloat(this.value);
	});
	$('#metrajeTotal').val(metraje.toFixed(2));
}

//	GENERAL
function getListaCortadores(){
    $.ajax({
        type: "GET",
        url: "/api/cortador",
        dataType: "JSON",
        success: function (response) {
            let x = '<option value="">Selecione un cortador</option>';
            response.forEach(element => {
                x += `<option ${verificarEstado(element.estado)} value='${element.id}'>${element.cortador}</option>`
            });
            $('#addCortado').append(x);
            $('#addCortado').select2();
        }
    });
}

function verificarEstado(data){
    if(data == 1){
        return '';
    }else{
		return 'disabled';
	}
}

function buscarProductoAddTabla(idRollo){
    let i = 0;
    while (i<listaPreCortado.length) {
        if(listaPreCortado[i].id == idRollo){
            tablaRollos.row.add(listaPreCortado[i]).draw();
            listaPreCortado.splice(i,1);
            $("#fila_"+idRollo).remove();
            break;
        }
        i++;
    }
}