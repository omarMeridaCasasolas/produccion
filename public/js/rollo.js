let tablaRollo;
$(document).ready(function () {
    getListaRollo();
    getListaTelasDisponibles();
    getListaProveedoresDisponibles();

    $('#addFormRollo').submit(function (e) { 
        e.preventDefault();
        let formData = $(this).serialize();
        $('#modalAgregarRollo').modal('hide');
        $.ajax({
            type: "POST",
            url: "/api/rollo",
            data: formData,
            dataType: "JSON",
            success: function (response) {
                if(response.estado == "Agregado"){
                    tablaRollo.ajax.reload();
					$('#addFormRollo')[0].reset();
                    Swal.fire('Exito!!','Se ha agregado rollo','success');
                }else{
                    Swal.fire('Error!!',response.estado,'error');
                }
            }
        });
    });

    //ELIMINAR ROLLO
	$("#tablaRollo tbody").on('click','button.deletRollo',function () {
		let datos = tablaRollo.row( $(this).parents('tr') ).data();
        console.log(datos);
        $("#deletIdRollo").html(datos.id);
        $("#deletCodigoRollo").html(datos.codigo_rollo);
    });

	$("#checkConfirmacion").change(function (e) { 
		e.preventDefault();
		let res = $('#checkConfirmacion').is(':checked');
		if(res){
			$('#btnEliminarRollo').prop("disabled", false);
		}else{
			$('#btnEliminarRollo').prop("disabled", true);
		}
	});

	$("#formDeletRollo").submit(function (e) { 
		e.preventDefault();
		$('#modalEliminarRollo').modal('hide');
		$.ajax({
			type: "DELETE",
			url: "/api/rollo/"+$("#deletIdRollo").html(),
			dataType: "JSON",
			beforeSend: function() {
				Swal.fire('Espere por favor...');
				Swal.showLoading();
			},
			success: function (response) {
				console.log(response);
				if(response.estado == "Eliminado"){
					$('#checkConfirmacion').prop('checked', false);
					$('#btnEliminarRollo').prop("disabled", true);
                    tablaRollo.ajax.reload();
                    Swal.fire('Exito!!','Se ha eliminado el rollo con codigo '+$("#deletCodigoRollo").html(),'success');
                }else{
                    Swal.fire('Error!!','No se puede codigo por que se tiene registros de ventas o traspaso relacionadas','error');
                }
			}
		});
	});

	$('#modalEliminarRollo').on('hidden.bs.modal', function () {
        $('#checkConfirmacion').prop('checked', false); 
        $('#btnEliminarRollo').prop('disabled', true); 
    });
});

function getListaRollo(){
    $('#tablaRollo').dataTable().fnDestroy();
	tablaRollo = $("#tablaRollo").DataTable({
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
			url: "/api/rollo",
			// data: { metodo: "getListaUsuarios"},
		},
		columns: [
            { data: "id", width: "5%" },
			{ data: "proveedor", width: "10%" },
			{ data: "tela", width: "10%" },
			{ data: "codigo_rollo", width: "10%" },
            { data: "detalle", width: "10%" },
            { data: "altura", width: "10%" },
            { data: "ancho", width: "10%" },
            { data: "metraje", width: "10%" },
            { data: "precio", width: "10%" },
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
                "<button type='button' class='deletRollo btn btn-danger btn-sm' data-toggle='modal' data-target='#modalEliminarRollo'><i class='fas fa-trash'></i></button> ",
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

function getListaTelasDisponibles(){
    $.ajax({
        type: "GET",
        url: "/api/telasDisponibles",
        dataType: "JSON",
        success: function (response) {
            let  x = `<option value=''>Selecione un tela</option>`;
            response.forEach(element => {
                x += `<option value='${element.id}'>${element.codigo} - ${element.nombre}</option>`;
            });
            $('#addTela').append(x);
            $('#addTela').select2();
        }
    });
}

function getListaProveedoresDisponibles(){
    $.ajax({
        type: "GET",
        url: "/api/proveedoresDisponibles",
        dataType: "JSON",
        success: function (response) {
            let  x = `<option value=''>Selecione un proveedor</option>`;
            response.forEach(element => {
                x += `<option value='${element.id}'>${element.nombre}</option>`;
            });
            $('#addProveedor').append(x);
            $('#addProveedor').select2();
        }
    });
}

