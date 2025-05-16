namespace omega_project

open WebSharper
open WebSharper.Sitelets
open System.Collections.Generic
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Http
open System.Text.Json
open System.Collections.Concurrent

[<JavaScript false>]
module StudyBackend =
    open omega_project.Client.Shared

    // In-memory storage for demo purposes
    let studies = ResizeArray<StudyEntry>()

    [<Rpc>]
    let GetAll () : Async<StudyEntry list> =
        async { return studies |> Seq.toList }

    [<Rpc>]
    let Add (entry: StudyEntry) : Async<unit> =
        async { studies.Add(entry) }

    [<Rpc>]
    let Update (index: int) (entry: StudyEntry) : Async<unit> =
        async {
            if index >= 0 && index < studies.Count then
                studies.[index] <- entry
        }

    [<Rpc>]
    let Delete (index: int) : Async<unit> =
        async {
            if index >= 0 && index < studies.Count then
                studies.RemoveAt(index)
        }

    [<Rpc>]
    let ClearAll () : Async<unit> =
        async { studies.Clear() }

module Server

open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Http
open System.Text.Json
open System.Collections.Concurrent

type StudyEntry = {
    subject: string
    minutes: int
    plannedTime: int
    priority: string
    deadline: string
    completed: bool
}

module Server =
    let studies = ConcurrentBag<StudyEntry>()

    let jsonOptions = JsonSerializerOptions(PropertyNamingPolicy = JsonNamingPolicy.CamelCase)

    let registerApi (app: WebApplication) =
        // GET /api/studies
        app.MapGet("/api/studies", Func<HttpContext, System.Threading.Tasks.Task>(fun ctx ->
            let arr = studies.ToArray()
            ctx.Response.ContentType <- "application/json"
            ctx.Response.WriteAsync(JsonSerializer.Serialize(arr, jsonOptions))
        )) |> ignore

        // POST /api/studies
        app.MapPost("/api/studies", Func<HttpContext, System.Threading.Tasks.Task>(fun ctx ->
            task {
                let! entry = JsonSerializer.DeserializeAsync<StudyEntry>(ctx.Request.Body, jsonOptions)
                studies.Add(entry)
                ctx.Response.StatusCode <- 201
            }
        )) |> ignore

        // DELETE /api/studies
        app.MapDelete("/api/studies", Func<HttpContext, System.Threading.Tasks.Task>(fun ctx ->
            while not studies.IsEmpty do
                let mutable dummy = Unchecked.defaultof<StudyEntry>
                studies.TryTake(&dummy) |> ignore
            ctx.Response.StatusCode <- 204
            System.Threading.Tasks.Task.CompletedTask
        )) |> ignore

        // DELETE /api/studies/{index}
        app.MapDelete("/api/studies/{index:int}", Func<HttpContext, int, System.Threading.Tasks.Task>(fun ctx index ->
            let arr = studies.ToArray()
            if index >= 0 && index < arr.Length then
                let item = arr.[index]
                let mutable removed = false
                let mutable dummy = Unchecked.defaultof<StudyEntry>
                for s in studies do
                    if not removed && s = item then
                        studies.TryTake(&dummy) |> ignore
                        removed <- true
                ctx.Response.StatusCode <- 204
            else
                ctx.Response.StatusCode <- 404
            System.Threading.Tasks.Task.CompletedTask
        )) |> ignore
