let tablaCorte;
const jwtToken = localStorage.getItem('jwtToken');
$(document).ready(function () {
    getListaCortes();
});

function getListaCortes(){
    $('#tablaCorte').dataTable().fnDestroy();
	tablaCorte = $("#tablaCorte").DataTable({
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
			url: "/api/corte",
            headers: {
                "Authorization": `${jwtToken}`
            },
		},
		columns: [
            { data: "id", width: "5%" },
            { data: "codigo", width: "9%" },
            { data: "empleado", width: "14%" },
            { data: "personal", width: "14%" },
            { data: "detalle", width: "14%" },
            { data: "talla", width: "8%" },
            { data: "metraje_actual", width: "9%" },
            { data: "cantidad_actual", width: "9%" },
			{ data: "estado_corte",
				render: function (data) {
				  if (data == 'Revision') {
					return `<h5><span class="badge badge-info">${data}</span></h5>`;
					} else {
						if(data == 'Inactivo'){
							return `<h5><span class="badge badge-warning">${data}</span></h5>`;
						}else{
							return `<h5><span class="badge badge-success">${data}</span></h5>`;
						}
					}
				},width: "9%",
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