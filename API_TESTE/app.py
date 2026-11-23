from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

tickets = [
    {
        "id": 1,
        "titulo": "Computador não liga",
        "descricao": "Equipamento não inicia",
        "prioridade": "alta",
        "status": "aberto"
    },
    {
        "id": 2,
        "titulo": "Problema com impressora",
        "descricao": "Impressora não responde",
        "prioridade": "media",
        "status": "em andamento"
    }
]


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "API funcionando!"})


@app.route("/api/tickets", methods=["GET"])
def listar_tickets():
    return jsonify(tickets)


@app.route("/api/tickets/<int:ticket_id>", methods=["GET"])
def buscar_ticket(ticket_id):

    for ticket in tickets:
        if ticket["id"] == ticket_id:
            return jsonify(ticket)

    return jsonify({"erro": "Chamado nao encontrado"})


if __name__ == "__main__":
    app.run(debug=True)