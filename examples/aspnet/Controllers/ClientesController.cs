using Microsoft.AspNetCore.Mvc;

namespace RouteLens.Example.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClientesController : ControllerBase
{
    [HttpGet]
    public IActionResult Index()
    {
        return Ok(Array.Empty<object>());
    }

    [HttpGet("{id}")]
    public IActionResult Show(string id)
    {
        return Ok(new { id });
    }

    [HttpPost]
    public IActionResult Store(object cliente)
    {
        return Created("/api/clientes/1", cliente);
    }

    [HttpPut("{id}")]
    public IActionResult Update(string id, object cliente)
    {
        return Ok(cliente);
    }

    [HttpPatch("{id}")]
    public IActionResult UpdatePartial(string id, object cliente)
    {
        return Ok(cliente);
    }

    [HttpDelete("{id}")]
    public IActionResult Destroy(string id)
    {
        return NoContent();
    }
}
