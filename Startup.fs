open System
open Microsoft.AspNetCore.Builder
open Microsoft.Extensions.Hosting
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.DependencyInjection

[<EntryPoint>]
let main args =
    let builder = WebApplication.CreateBuilder(args)

    builder.Services.AddEndpointsApiExplorer() |> ignore
    builder.Services.AddCors() |> ignore

    let app = builder.Build()

    app.UseCors(fun options ->
        options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader() |> ignore
    ) |> ignore

    app.UseDefaultFiles() |> ignore
    app.UseStaticFiles() |> ignore

    // Eltávolítottuk a szerver oldali API regisztrációt, mivel a kliensben történik az exportálás

    app.Run()
    0
