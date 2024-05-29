﻿using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIMEXPRO.API.Models.ModelsAduana;
using SIMEXPRO.BussinessLogic.Services.EventoServices;
using SIMEXPRO.Entities.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SIMEXPRO.API.Controllers.ControllersAduanas
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImpuestosSelectivoConsumoCondicionesVehiculoController : ControllerBase
    {
        private readonly AduanaServices _aduanaServices;
        private readonly IMapper _mapper;

        public ImpuestosSelectivoConsumoCondicionesVehiculoController(AduanaServices aduanaServices, IMapper mapper)
        {
            _aduanaServices = aduanaServices;
            _mapper = mapper;
        }


        [HttpGet("Listar")]
        public IActionResult Index()
        {
            var listado = _aduanaServices.ListarISCCV();
            listado.Data = _mapper.Map<IEnumerable<ImpuestosSelectivoConsumoCondicionesVehiculosViewModel>>(listado.Data);
            return Ok(listado);
        }


        [HttpPost("Insertar")]
        public IActionResult Insertar(ImpuestosSelectivoConsumoCondicionesVehiculosViewModel aduanas)
        {
            var mapped = _mapper.Map<tbImpuestoSelectivoConsumoCondicionesVehiculos>(aduanas);
            var datos = _aduanaServices.InsertarISCCV(mapped);
            return Ok(datos);
        }

        [HttpPost("Editar")]
        public IActionResult Editar(ImpuestosSelectivoConsumoCondicionesVehiculosViewModel aduanas)
        {
            var mapped = _mapper.Map<tbImpuestoSelectivoConsumoCondicionesVehiculos>(aduanas);
            var datos = _aduanaServices.ActualizarISCCV(mapped);
            return Ok(datos);
        }

        [HttpPost("Eliminar")]
        public IActionResult Eliminar(ImpuestosSelectivoConsumoCondicionesVehiculosViewModel aduanas)
        {
            var mapped = _mapper.Map<tbImpuestoSelectivoConsumoCondicionesVehiculos>(aduanas);
            var datos = _aduanaServices.EliminarISCCV(mapped);
            return Ok(datos);
        }
    }
}
