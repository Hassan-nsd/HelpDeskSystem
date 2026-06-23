using HelpDesk.API.Data;
using HelpDesk.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
     private readonly IReportService _reportService;

     public ReportsController(IReportService reportService)
     {
          _reportService = reportService;
     }

     [HttpGet]
     public async Task<IActionResult> GetReportData()
     {
          var data =
              await _reportService.GetReportData();

          return Ok(data);
     }
}

