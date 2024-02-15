let tablaEmpleado;
const jwtToken = localStorage.getItem('jwtToken');
$(document).ready(function () {
    console.log(jwtToken);
    getListaEmpleados();

    // AGREAGAR EMPLEADO 
    $('#addFormEmpleado').submit(function (e) { 
        e.preventDefault();
        let formData = $(this).serialize();
        $('#modalAgregarEmpleado').modal('hide');
        $.ajax({
            type: "POST",
            url: "/api/empleado",
            data: formData,
            dataType: "JSON",
            success: function (response) {
                if(response.estado == "Agregado"){
                    tablaEmpleado.ajax.reload();
					$('#addFormEmpleado')[0].reset();
                    Swal.fire('Exito!!','Se ha agregado un nuevo empleado','success');
                }else{
                    Swal.fire('Error!!',response.estado,'error');
                }
            }
        });
    });

    //ELIMINAR EMPLEADO
	$("#tablaEmpleado tbody").on('click','button.deletEmpleado',function () {
		let datos = tablaEmpleado.row( $(this).parents('tr') ).data();
        console.log(datos);
        $("#deletIdEmpleado").html(datos.id);
        $("#deletNombreEmpleado").html(datos.nombre);
    });

	$("#checkConfirmacion").change(function (e) { 
		e.preventDefault();
		let res = $('#checkConfirmacion').is(':checked');
		if(res){
			$('#btnEliminarEmpleado').prop("disabled", false);
		}else{
			$('#btnEliminarEmpleado').prop("disabled", true);
		}
	});

	$("#formDeletEmpleado").submit(function (e) { 
		e.preventDefault();
		$('#modalEliminarEmpleado').modal('hide');
		$.ajax({
			type: "DELETE",
			url: "/api/empleado/"+$("#deletIdEmpleado").html(),
			dataType: "JSON",
			beforeSend: function() {
				Swal.fire('Espere por favor...');
				Swal.showLoading();
			},
			success: function (response) {
				console.log(response);
				if(response.estado == "Eliminado"){
					$('#checkConfirmacion').prop('checked', false);
					$('#btnEliminarEmpleado').prop("disabled", true);
                    tablaEmpleado.ajax.reload();
                    Swal.fire('Exito!!','Se ha eliminado el empleado con nombre '+$("#deletNombreEmpleado").html(),'success');
                }else{
                    Swal.fire('Error!!','No se puede eliminar el empleado por que tiene registrado trabajos','error');
                }
			}
		});
	});

	$('#modalEliminarEmpleado').on('hidden.bs.modal', function () {
        $('#checkConfirmacion').prop('checked', false); 
        $('#btnEliminarEmpleado').prop('disabled', true); 
    });
});

function getListaEmpleados(){
    $('#tablaEmpleado').dataTable().fnDestroy();
	tablaEmpleado = $("#tablaEmpleado").DataTable({
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
			// method: "GET",
            "type": "GET",
			url: "/api/empleado",
            "headers": {
                "Authorization": `Bearer ${jwtToken}`
            },
			// data: { metodo: "getListaUsuarios"},
		},
		columns: [
            { data: "id", width: "5%" },
			{ data: "nombre", width: "20%" },
            { data: "celular", width: "10%" },
            { data: "usuario", width: "25%" },
            { data: "tipo", width: "20%" },
			{ data: "estado", // can be null or undefined
				render: function (data) {
				  if (data == '1') {
					return '<h5><span class="badge badge-success">Activo</span></h5>';
					} else {
						return '<h5><span class="badge badge-danger">Baja</span></h5>';
					}
				},width: "10%",
			},
			{ data: null,
				defaultContent:
				"<button type='button' class='editUsuario btn btn-warning btn-sm' data-toggle='modal' data-target='#modalEditarUsuario'><i class='fas fa-edit'></i></button> "+
                "<button type='button' class='deletEmpleado btn btn-danger btn-sm' data-toggle='modal' data-target='#modalEliminarEmpleado'><i class='fas fa-trash'></i></button> ",
				width: "13%"
			}
		],
        dom: 'Blfrtip',
        // buttons: [
		// 	{ 	extend: 'copy',
		// 		className: 'btn btn-info  mb-3', 
		// 		text:      '<i class="fa fa-copy"></i> Copiar',
        //         titleAttr: 'Copy',
		// 		exportOptions: {
        //             columns: [ 0, 1, 2, 3]
        //         }
		// 	},
		// 	{ 	extend: 'csv', 
		// 		className: 'btn btn-warning  mb-3',
		// 		text:      '<i class="fas fa-file-csv"></i> CSV',
        //         titleAttr: 'csv',
		// 		exportOptions: {
        //             columns: [ 0, 1, 2, 3]
        //         } 
		// 	},
		// 	{ 	extend: 'excel', 
		// 		className: 'btn btn-success mb-3',
		// 		text:      '<i class="fas fa-file-excel"></i> Excel',
        //         titleAttr: 'Excel',
		// 		exportOptions: {
        //             columns: [ 0, 1, 2, 3]
        //         } 
		// 	},
		// 	{ 	extend: 'pdf', 
		// 		className: 'btn btn-danger  mb-3',
		// 		text:      '<i class="fas fa-file-pdf"></i> PDF',
        //         titleAttr: 'PDF',
		// 		alignment: 'center',
		// 		exportOptions: {
        //             columns: [ 0, 1, 2, 3]
        //         },
		// 		customize: function (doc) {
		// 			doc.content[1].table.widths =Array(doc.content[1].table.body[0].length + 1).join('*').split('');
    	// 			doc.defaultStyle.alignment = 'center';
		// 		} 
		// 	}
        // ]
        initComplete: function(settings, json) {
            // alert( 'DataTables has finished its initialisation.' );
            console.log(json);
          }
	});
}