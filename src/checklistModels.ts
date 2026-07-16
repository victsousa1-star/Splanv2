export type ChecklistTemplateId = "loja" | "loja-alimentacao" | "quiosque";
export type ChecklistRowKind = "section" | "subsection" | "item" | "note" | "field";

export interface ChecklistHeaderRow {
  rowNumber: number;
  left: string;
  right: string;
}

export interface ChecklistTemplateRow {
  id: string;
  rowNumber: number;
  kind: ChecklistRowKind;
  label: string;
}

export interface ChecklistTemplate {
  id: ChecklistTemplateId;
  label: string;
  sourceSheet: string;
  codeLabel: string;
  totalItems: number;
  header: ChecklistHeaderRow[];
  rows: ChecklistTemplateRow[];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    "id": "loja",
    "label": "Vistoria Final em Obras de Loja",
    "sourceSheet": "Vistoria Lojas",
    "codeLabel": "SUC",
    "totalItems": 133,
    "header": [
      {
        "rowNumber": 3,
        "left": "SUC:",
        "right": "Data:"
      },
      {
        "rowNumber": 4,
        "left": "Nome Fantasia:",
        "right": "Vistoria:"
      },
      {
        "rowNumber": 5,
        "left": "Empresas:",
        "right": ""
      },
      {
        "rowNumber": 6,
        "left": "Data de início da obra:",
        "right": "Inauguração"
      },
      {
        "rowNumber": 7,
        "left": "Serviço executado na hora da vistoria:",
        "right": ""
      }
    ],
    "rows": [
      {
        "id": "loja-r7",
        "rowNumber": 7,
        "kind": "field",
        "label": "Serviço executado na hora da vistoria:"
      },
      {
        "id": "loja-r8",
        "rowNumber": 8,
        "kind": "section",
        "label": "Documentos"
      },
      {
        "id": "loja-r9",
        "rowNumber": 9,
        "kind": "subsection",
        "label": "Documentos"
      },
      {
        "id": "loja-r10",
        "rowNumber": 10,
        "kind": "item",
        "label": "ART de Execução"
      },
      {
        "id": "loja-r11",
        "rowNumber": 11,
        "kind": "item",
        "label": "Seguro de obra"
      },
      {
        "id": "loja-r12",
        "rowNumber": 12,
        "kind": "item",
        "label": "AVCB ou protocolo de solicitação do AVCB"
      },
      {
        "id": "loja-r13",
        "rowNumber": 13,
        "kind": "section",
        "label": "Projetos"
      },
      {
        "id": "loja-r14",
        "rowNumber": 14,
        "kind": "subsection",
        "label": "Arquitetura"
      },
      {
        "id": "loja-r15",
        "rowNumber": 15,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-r16",
        "rowNumber": 16,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r17",
        "rowNumber": 17,
        "kind": "item",
        "label": "O layout apresentado é compativel com o do projeto aprovado?"
      },
      {
        "id": "loja-r18",
        "rowNumber": 18,
        "kind": "subsection",
        "label": "Iluminação"
      },
      {
        "id": "loja-r19",
        "rowNumber": 19,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-r20",
        "rowNumber": 20,
        "kind": "subsection",
        "label": "Teto Refletido"
      },
      {
        "id": "loja-r21",
        "rowNumber": 21,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-r22",
        "rowNumber": 22,
        "kind": "subsection",
        "label": "Estrutura"
      },
      {
        "id": "loja-r23",
        "rowNumber": 23,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-r24",
        "rowNumber": 24,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r25",
        "rowNumber": 25,
        "kind": "subsection",
        "label": "Elétrico"
      },
      {
        "id": "loja-r26",
        "rowNumber": 26,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-r27",
        "rowNumber": 27,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r28",
        "rowNumber": 28,
        "kind": "subsection",
        "label": "CFTV e alarme de intrusão"
      },
      {
        "id": "loja-r29",
        "rowNumber": 29,
        "kind": "item",
        "label": "Projeto foi aprovado?"
      },
      {
        "id": "loja-r30",
        "rowNumber": 30,
        "kind": "subsection",
        "label": "Incêndio"
      },
      {
        "id": "loja-r31",
        "rowNumber": 31,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-r32",
        "rowNumber": 32,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r33",
        "rowNumber": 33,
        "kind": "subsection",
        "label": "Ar Condicionado"
      },
      {
        "id": "loja-r34",
        "rowNumber": 34,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-r35",
        "rowNumber": 35,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r36",
        "rowNumber": 36,
        "kind": "subsection",
        "label": "Hidrossanitário"
      },
      {
        "id": "loja-r37",
        "rowNumber": 37,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-r38",
        "rowNumber": 38,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r39",
        "rowNumber": 39,
        "kind": "subsection",
        "label": "Exaustão/CO²"
      },
      {
        "id": "loja-r40",
        "rowNumber": 40,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-r41",
        "rowNumber": 41,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r42",
        "rowNumber": 42,
        "kind": "subsection",
        "label": "Gás"
      },
      {
        "id": "loja-r43",
        "rowNumber": 43,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-r44",
        "rowNumber": 44,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-r45",
        "rowNumber": 45,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r46",
        "rowNumber": 46,
        "kind": "section",
        "label": "Arquitetura"
      },
      {
        "id": "loja-r47",
        "rowNumber": 47,
        "kind": "subsection",
        "label": "Fachada"
      },
      {
        "id": "loja-r48",
        "rowNumber": 48,
        "kind": "item",
        "label": "Avanço até o perfil divisório"
      },
      {
        "id": "loja-r49",
        "rowNumber": 49,
        "kind": "item",
        "label": "Acabamentos"
      },
      {
        "id": "loja-r50",
        "rowNumber": 50,
        "kind": "item",
        "label": "Pintura rodateto"
      },
      {
        "id": "loja-r51",
        "rowNumber": 51,
        "kind": "item",
        "label": "Pintura do forro na área do tapume"
      },
      {
        "id": "loja-r52",
        "rowNumber": 52,
        "kind": "item",
        "label": "Vidro da fachada limpo?"
      },
      {
        "id": "loja-r53",
        "rowNumber": 53,
        "kind": "subsection",
        "label": "Rodapé de Proteção de Fachada (h=20cm)"
      },
      {
        "id": "loja-r54",
        "rowNumber": 54,
        "kind": "item",
        "label": "Rodapé instalado?"
      },
      {
        "id": "loja-r55",
        "rowNumber": 55,
        "kind": "item",
        "label": "Rodapé limpo e conservado?"
      },
      {
        "id": "loja-r56",
        "rowNumber": 56,
        "kind": "subsection",
        "label": "Letreiro"
      },
      {
        "id": "loja-r57",
        "rowNumber": 57,
        "kind": "item",
        "label": "Letreiro instalado?"
      },
      {
        "id": "loja-r58",
        "rowNumber": 58,
        "kind": "subsection",
        "label": "Letreiro avançando apenas 15cm?"
      },
      {
        "id": "loja-r59",
        "rowNumber": 59,
        "kind": "item",
        "label": "Sem fiação exposta"
      },
      {
        "id": "loja-r60",
        "rowNumber": 60,
        "kind": "subsection",
        "label": "Desnível entre piso da Loja e do Mall"
      },
      {
        "id": "loja-r61",
        "rowNumber": 61,
        "kind": "item",
        "label": "Não há desnível ou obstáculo trepidante"
      },
      {
        "id": "loja-r62",
        "rowNumber": 62,
        "kind": "item",
        "label": "Pedra do Shopping quebrada?"
      },
      {
        "id": "loja-r63",
        "rowNumber": 63,
        "kind": "subsection",
        "label": "Alçapão e Portinhola"
      },
      {
        "id": "loja-r64",
        "rowNumber": 64,
        "kind": "item",
        "label": "Porta de enrolar"
      },
      {
        "id": "loja-r65",
        "rowNumber": 65,
        "kind": "subsection",
        "label": "Mobiliário"
      },
      {
        "id": "loja-r66",
        "rowNumber": 66,
        "kind": "item",
        "label": "Mobiliário instalado?"
      },
      {
        "id": "loja-r67",
        "rowNumber": 67,
        "kind": "subsection",
        "label": "Luminárias"
      },
      {
        "id": "loja-r68",
        "rowNumber": 68,
        "kind": "item",
        "label": "Luminárias instaladas?"
      },
      {
        "id": "loja-r69",
        "rowNumber": 69,
        "kind": "item",
        "label": "Acabamento em volta da luminária ok?"
      },
      {
        "id": "loja-r70",
        "rowNumber": 70,
        "kind": "subsection",
        "label": "Piso"
      },
      {
        "id": "loja-r71",
        "rowNumber": 71,
        "kind": "item",
        "label": "Rejunte com bom acabamento?"
      },
      {
        "id": "loja-r72",
        "rowNumber": 72,
        "kind": "subsection",
        "label": "Outros"
      },
      {
        "id": "loja-r73",
        "rowNumber": 73,
        "kind": "item",
        "label": "Eletrodomésticos"
      },
      {
        "id": "loja-r74",
        "rowNumber": 74,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r75",
        "rowNumber": 75,
        "kind": "section",
        "label": "Estrutura"
      },
      {
        "id": "loja-r76",
        "rowNumber": 76,
        "kind": "subsection",
        "label": "Escada Marinheiro"
      },
      {
        "id": "loja-r77",
        "rowNumber": 77,
        "kind": "item",
        "label": "Fixa no piso"
      },
      {
        "id": "loja-r78",
        "rowNumber": 78,
        "kind": "item",
        "label": "Barras avançando 1.40m"
      },
      {
        "id": "loja-r79",
        "rowNumber": 79,
        "kind": "subsection",
        "label": "Escada"
      },
      {
        "id": "loja-r80",
        "rowNumber": 80,
        "kind": "item",
        "label": "80cm livre"
      },
      {
        "id": "loja-r81",
        "rowNumber": 81,
        "kind": "item",
        "label": "Corrimão dos dois lados"
      },
      {
        "id": "loja-r82",
        "rowNumber": 82,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r83",
        "rowNumber": 83,
        "kind": "section",
        "label": "Lojas Sensíveis"
      },
      {
        "id": "loja-r84",
        "rowNumber": 84,
        "kind": "item",
        "label": "Câmera no interior e exterior da loja"
      },
      {
        "id": "loja-r85",
        "rowNumber": 85,
        "kind": "item",
        "label": "Cofre"
      },
      {
        "id": "loja-r86",
        "rowNumber": 86,
        "kind": "item",
        "label": "Dispositivo de detecção de presença"
      },
      {
        "id": "loja-r87",
        "rowNumber": 87,
        "kind": "item",
        "label": "Seguro válido para o estoque de mercadorias"
      },
      {
        "id": "loja-r88",
        "rowNumber": 88,
        "kind": "item",
        "label": "Sistema de pop-up de câmeras no CFTV"
      },
      {
        "id": "loja-r89",
        "rowNumber": 89,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r90",
        "rowNumber": 90,
        "kind": "section",
        "label": "Elétrica"
      },
      {
        "id": "loja-r91",
        "rowNumber": 91,
        "kind": "subsection",
        "label": "Iluminação de Emergência"
      },
      {
        "id": "loja-r92",
        "rowNumber": 92,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r93",
        "rowNumber": 93,
        "kind": "item",
        "label": "Instaladas?"
      },
      {
        "id": "loja-r94",
        "rowNumber": 94,
        "kind": "subsection",
        "label": "Medidor de Energia Instalado"
      },
      {
        "id": "loja-r95",
        "rowNumber": 95,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r96",
        "rowNumber": 96,
        "kind": "field",
        "label": "Medição do medidor:"
      },
      {
        "id": "loja-r97",
        "rowNumber": 97,
        "kind": "subsection",
        "label": "QDL"
      },
      {
        "id": "loja-r98",
        "rowNumber": 98,
        "kind": "item",
        "label": "Testados todos os circuitos  ?"
      },
      {
        "id": "loja-r99",
        "rowNumber": 99,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r100",
        "rowNumber": 100,
        "kind": "item",
        "label": "Enumeração e identificação dos circuitos?"
      },
      {
        "id": "loja-r101",
        "rowNumber": 101,
        "kind": "item",
        "label": "Proteção do quadro?"
      },
      {
        "id": "loja-r102",
        "rowNumber": 102,
        "kind": "item",
        "label": "Existe Disjuntor DR (Diferencial Residual)?"
      },
      {
        "id": "loja-r103",
        "rowNumber": 103,
        "kind": "item",
        "label": "Existe Disjuntor DG?"
      },
      {
        "id": "loja-r104",
        "rowNumber": 104,
        "kind": "item",
        "label": "Possui timer?"
      },
      {
        "id": "loja-r105",
        "rowNumber": 105,
        "kind": "item",
        "label": "Limpeza do quadro?"
      },
      {
        "id": "loja-r106",
        "rowNumber": 106,
        "kind": "item",
        "label": "Aterramento do quadro?"
      },
      {
        "id": "loja-r107",
        "rowNumber": 107,
        "kind": "item",
        "label": "Aterramento da tampa?"
      },
      {
        "id": "loja-r108",
        "rowNumber": 108,
        "kind": "item",
        "label": "Barramento de Neutro?"
      },
      {
        "id": "loja-r109",
        "rowNumber": 109,
        "kind": "item",
        "label": "Barramento de Terra?"
      },
      {
        "id": "loja-r110",
        "rowNumber": 110,
        "kind": "item",
        "label": "Fixação de cabeamentos?"
      },
      {
        "id": "loja-r111",
        "rowNumber": 111,
        "kind": "item",
        "label": "Seletividade de disjuntores?"
      },
      {
        "id": "loja-r112",
        "rowNumber": 112,
        "kind": "item",
        "label": "Organização de cabeamento?"
      },
      {
        "id": "loja-r113",
        "rowNumber": 113,
        "kind": "item",
        "label": "Unifilar na porta?"
      },
      {
        "id": "loja-r114",
        "rowNumber": 114,
        "kind": "item",
        "label": "Proteção interna fixada?"
      },
      {
        "id": "loja-r115",
        "rowNumber": 115,
        "kind": "item",
        "label": "Quadro fixado?"
      },
      {
        "id": "loja-r116",
        "rowNumber": 116,
        "kind": "item",
        "label": "Todos os cabos com terminais?"
      },
      {
        "id": "loja-r117",
        "rowNumber": 117,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r118",
        "rowNumber": 118,
        "kind": "section",
        "label": "Telefonia"
      },
      {
        "id": "loja-r119",
        "rowNumber": 119,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r120",
        "rowNumber": 120,
        "kind": "item",
        "label": "Testada a rede telefônica"
      },
      {
        "id": "loja-r121",
        "rowNumber": 121,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r122",
        "rowNumber": 122,
        "kind": "section",
        "label": "Alarme de Intrusão e Sensor de Presença"
      },
      {
        "id": "loja-r123",
        "rowNumber": 123,
        "kind": "item",
        "label": "Instalado?"
      },
      {
        "id": "loja-r124",
        "rowNumber": 124,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r125",
        "rowNumber": 125,
        "kind": "section",
        "label": "Hidrossanitário"
      },
      {
        "id": "loja-r126",
        "rowNumber": 126,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r127",
        "rowNumber": 127,
        "kind": "item",
        "label": "Hidrômetro instalado"
      },
      {
        "id": "loja-r128",
        "rowNumber": 128,
        "kind": "field",
        "label": "Medição do hidrômetro:"
      },
      {
        "id": "loja-r129",
        "rowNumber": 129,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r130",
        "rowNumber": 130,
        "kind": "section",
        "label": "Combate à incêndio"
      },
      {
        "id": "loja-r131",
        "rowNumber": 131,
        "kind": "subsection",
        "label": "Teste de Estanquiedade"
      },
      {
        "id": "loja-r132",
        "rowNumber": 132,
        "kind": "item",
        "label": "Efetuado teste de Estanqueidade?"
      },
      {
        "id": "loja-r133",
        "rowNumber": 133,
        "kind": "item",
        "label": "Teste de Estanquiedade aprovado?"
      },
      {
        "id": "loja-r134",
        "rowNumber": 134,
        "kind": "item",
        "label": "Emitido Laudo?"
      },
      {
        "id": "loja-r135",
        "rowNumber": 135,
        "kind": "subsection",
        "label": "Detectores de fumaça"
      },
      {
        "id": "loja-r136",
        "rowNumber": 136,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r137",
        "rowNumber": 137,
        "kind": "item",
        "label": "Detectores de fumaça instalados?"
      },
      {
        "id": "loja-r138",
        "rowNumber": 138,
        "kind": "item",
        "label": "Acionador Manual"
      },
      {
        "id": "loja-r139",
        "rowNumber": 139,
        "kind": "item",
        "label": "Central instalada?"
      },
      {
        "id": "loja-r140",
        "rowNumber": 140,
        "kind": "item",
        "label": "Central apresenta falha?"
      },
      {
        "id": "loja-r141",
        "rowNumber": 141,
        "kind": "subsection",
        "label": "Extintores"
      },
      {
        "id": "loja-r142",
        "rowNumber": 142,
        "kind": "item",
        "label": "Extintor desobstruído?"
      },
      {
        "id": "loja-r143",
        "rowNumber": 143,
        "kind": "item",
        "label": "Extintor sinalizado?"
      },
      {
        "id": "loja-r144",
        "rowNumber": 144,
        "kind": "item",
        "label": "Quantidade de extintores conforme projeto?"
      },
      {
        "id": "loja-r145",
        "rowNumber": 145,
        "kind": "item",
        "label": "Extintores fixados em suporte ou tripé?"
      },
      {
        "id": "loja-r146",
        "rowNumber": 146,
        "kind": "item",
        "label": "Extintores com validade e carga conforme?"
      },
      {
        "id": "loja-r147",
        "rowNumber": 147,
        "kind": "item",
        "label": "Sinalização de rota de fuga e saída de emergência conforme projeto aprovado?"
      },
      {
        "id": "loja-r148",
        "rowNumber": 148,
        "kind": "item",
        "label": "Placas de sinalização de emergência com CNPJ do fabricante e fator de luminosidade?"
      },
      {
        "id": "loja-r149",
        "rowNumber": 149,
        "kind": "item",
        "label": "Altura das placas de extintores e de emergência a 1,80M?"
      },
      {
        "id": "loja-r150",
        "rowNumber": 150,
        "kind": "subsection",
        "label": "Sprinkler"
      },
      {
        "id": "loja-r151",
        "rowNumber": 151,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r152",
        "rowNumber": 152,
        "kind": "item",
        "label": "Ponto em todos os ambientes?"
      },
      {
        "id": "loja-r153",
        "rowNumber": 153,
        "kind": "item",
        "label": "Bicos obstruídos?"
      },
      {
        "id": "loja-r154",
        "rowNumber": 154,
        "kind": "item",
        "label": "Classificação de bico de SPK conforme projeto"
      },
      {
        "id": "loja-r155",
        "rowNumber": 155,
        "kind": "item",
        "label": "Materiais pendurados nos bicos de SPK"
      },
      {
        "id": "loja-r156",
        "rowNumber": 156,
        "kind": "item",
        "label": "Tubulação pintada conforme norma"
      },
      {
        "id": "loja-r157",
        "rowNumber": 157,
        "kind": "item",
        "label": "Bicos de SPK antigos e desgastados"
      },
      {
        "id": "loja-r158",
        "rowNumber": 158,
        "kind": "item",
        "label": "Área de atuação de SPK obstruída"
      },
      {
        "id": "loja-r159",
        "rowNumber": 159,
        "kind": "item",
        "label": "Dreno de SPK com válvula e altura adequada (1.60m)"
      },
      {
        "id": "loja-r160",
        "rowNumber": 160,
        "kind": "item",
        "label": "Dreno de SPK possui manômetro e tapes na extremidade"
      },
      {
        "id": "loja-r161",
        "rowNumber": 161,
        "kind": "item",
        "label": "Válvula tipo esfera de SPK está aberta?"
      },
      {
        "id": "loja-r162",
        "rowNumber": 162,
        "kind": "item",
        "label": "As placas de sinalização de incêndio da loja estão de acordo com a legislação vigente?"
      },
      {
        "id": "loja-r163",
        "rowNumber": 163,
        "kind": "item",
        "label": "Existe SPK no entreforro?"
      },
      {
        "id": "loja-r164",
        "rowNumber": 164,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r165",
        "rowNumber": 165,
        "kind": "section",
        "label": "Ar-condicionado"
      },
      {
        "id": "loja-r166",
        "rowNumber": 166,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-r167",
        "rowNumber": 167,
        "kind": "subsection",
        "label": "Temperatura na Loja - Hora Verificação"
      },
      {
        "id": "loja-r168",
        "rowNumber": 168,
        "kind": "subsection",
        "label": "Temperatura de saída"
      },
      {
        "id": "loja-r169",
        "rowNumber": 169,
        "kind": "subsection",
        "label": "Temperatura de entrada"
      },
      {
        "id": "loja-r170",
        "rowNumber": 170,
        "kind": "item",
        "label": "Plataforma de Manutenção"
      },
      {
        "id": "loja-r171",
        "rowNumber": 171,
        "kind": "item",
        "label": "Espaço para manutenção fancoil (2 lados 60cm; 2 lados 40cm)"
      },
      {
        "id": "loja-r172",
        "rowNumber": 172,
        "kind": "item",
        "label": "Grelhas e difusores instalados"
      },
      {
        "id": "loja-r173",
        "rowNumber": 173,
        "kind": "item",
        "label": "Termômetros"
      },
      {
        "id": "loja-r174",
        "rowNumber": 174,
        "kind": "item",
        "label": "Manômetros"
      },
      {
        "id": "loja-r175",
        "rowNumber": 175,
        "kind": "item",
        "label": "Válvula 2 vias de controle"
      },
      {
        "id": "loja-r176",
        "rowNumber": 176,
        "kind": "item",
        "label": "Termostato para controle"
      },
      {
        "id": "loja-r177",
        "rowNumber": 177,
        "kind": "item",
        "label": "Válvulas de bloqueio"
      },
      {
        "id": "loja-r178",
        "rowNumber": 178,
        "kind": "item",
        "label": "Filtro Y"
      },
      {
        "id": "loja-r179",
        "rowNumber": 179,
        "kind": "item",
        "label": "Condições dos filtros"
      },
      {
        "id": "loja-r180",
        "rowNumber": 180,
        "kind": "item",
        "label": "Bandeja"
      },
      {
        "id": "loja-r181",
        "rowNumber": 181,
        "kind": "item",
        "label": "Serpentina"
      },
      {
        "id": "loja-r182",
        "rowNumber": 182,
        "kind": "item",
        "label": "Isolamento elastomérico da tubulação de AG"
      },
      {
        "id": "loja-r183",
        "rowNumber": 183,
        "kind": "item",
        "label": "Dreno água gelada"
      },
      {
        "id": "loja-r184",
        "rowNumber": 184,
        "kind": "item",
        "label": "Dreno água gelada saída"
      },
      {
        "id": "loja-r185",
        "rowNumber": 185,
        "kind": "item",
        "label": "Duto de insuflamento"
      },
      {
        "id": "loja-r186",
        "rowNumber": 186,
        "kind": "item",
        "label": "Duto de Retorno"
      },
      {
        "id": "loja-r187",
        "rowNumber": 187,
        "kind": "item",
        "label": "Duto de Renovação"
      },
      {
        "id": "loja-r188",
        "rowNumber": 188,
        "kind": "item",
        "label": "Instalação elétrica do motor"
      },
      {
        "id": "loja-r189",
        "rowNumber": 189,
        "kind": "item",
        "label": "Interligação do dreno no retorno da água gelada com o esgoto do Shopping?"
      },
      {
        "id": "loja-r190",
        "rowNumber": 190,
        "kind": "item",
        "label": "Dreno com sifão?"
      },
      {
        "id": "loja-r191",
        "rowNumber": 191,
        "kind": "item",
        "label": "Casa de máquinas estanque?"
      },
      {
        "id": "loja-r192",
        "rowNumber": 192,
        "kind": "item",
        "label": "Realizado o teste de impermeabilização da casa de máquinas?"
      },
      {
        "id": "loja-r193",
        "rowNumber": 193,
        "kind": "item",
        "label": "Válvula de água gelada aberta?"
      },
      {
        "id": "loja-r194",
        "rowNumber": 194,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-r195",
        "rowNumber": 195,
        "kind": "section",
        "label": "PREPARAÇÃO DA LOJA"
      },
      {
        "id": "loja-r196",
        "rowNumber": 196,
        "kind": "item",
        "label": "Loja Concluída"
      },
      {
        "id": "loja-r197",
        "rowNumber": 197,
        "kind": "item",
        "label": "Integração do sistema Esphera"
      },
      {
        "id": "loja-r198",
        "rowNumber": 198,
        "kind": "item",
        "label": "Limpeza Efetuada"
      },
      {
        "id": "loja-r200",
        "rowNumber": 200,
        "kind": "field",
        "label": "PRAZO PARA SOLUÇÃO DAS PENDÊNCIAS:"
      },
      {
        "id": "loja-r201",
        "rowNumber": 201,
        "kind": "field",
        "label": "RESPONSÁVEL PELA LOJA:"
      },
      {
        "id": "loja-r202",
        "rowNumber": 202,
        "kind": "field",
        "label": "RESPONSÁVEL PELA OBRA:"
      },
      {
        "id": "loja-r203",
        "rowNumber": 203,
        "kind": "field",
        "label": "QUALIDADE - SHOPPINGRIO POTY:"
      },
      {
        "id": "loja-r204",
        "rowNumber": 204,
        "kind": "field",
        "label": "MANUTENÇÃO - SHOPPING RIO POTY:"
      },
      {
        "id": "loja-r205",
        "rowNumber": 205,
        "kind": "field",
        "label": "BRIGADA - SHOPPING RIO POTY:"
      }
    ]
  },
  {
    "id": "loja-alimentacao",
    "label": "Vistoria Final em Obras de Loja Alimentação",
    "sourceSheet": "Vistoria Lojas Alimentação",
    "codeLabel": "SUC",
    "totalItems": 130,
    "header": [
      {
        "rowNumber": 3,
        "left": "SUC:",
        "right": "Data:"
      },
      {
        "rowNumber": 4,
        "left": "Nome Fantasia:",
        "right": "Vistoria:"
      },
      {
        "rowNumber": 5,
        "left": "Empresas:",
        "right": ""
      },
      {
        "rowNumber": 6,
        "left": "Data de início da obra:",
        "right": "Inauguração"
      },
      {
        "rowNumber": 7,
        "left": "Serviço executado na hora da vistoria:",
        "right": ""
      }
    ],
    "rows": [
      {
        "id": "loja-alimentacao-r7",
        "rowNumber": 7,
        "kind": "field",
        "label": "Serviço executado na hora da vistoria:"
      },
      {
        "id": "loja-alimentacao-r8",
        "rowNumber": 8,
        "kind": "section",
        "label": "Documentos"
      },
      {
        "id": "loja-alimentacao-r9",
        "rowNumber": 9,
        "kind": "subsection",
        "label": "Documentos"
      },
      {
        "id": "loja-alimentacao-r10",
        "rowNumber": 10,
        "kind": "item",
        "label": "ART de Execução"
      },
      {
        "id": "loja-alimentacao-r11",
        "rowNumber": 11,
        "kind": "item",
        "label": "Seguro de obra"
      },
      {
        "id": "loja-alimentacao-r12",
        "rowNumber": 12,
        "kind": "item",
        "label": "AVCB ou protocolo de solicitação do AVCB"
      },
      {
        "id": "loja-alimentacao-r13",
        "rowNumber": 13,
        "kind": "section",
        "label": "Projetos"
      },
      {
        "id": "loja-alimentacao-r14",
        "rowNumber": 14,
        "kind": "subsection",
        "label": "Arquitetura"
      },
      {
        "id": "loja-alimentacao-r15",
        "rowNumber": 15,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-alimentacao-r16",
        "rowNumber": 16,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r17",
        "rowNumber": 17,
        "kind": "item",
        "label": "O layout apresentado é compativel com o do projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r18",
        "rowNumber": 18,
        "kind": "subsection",
        "label": "Iluminação"
      },
      {
        "id": "loja-alimentacao-r19",
        "rowNumber": 19,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-alimentacao-r20",
        "rowNumber": 20,
        "kind": "subsection",
        "label": "Teto Refletido"
      },
      {
        "id": "loja-alimentacao-r21",
        "rowNumber": 21,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-alimentacao-r22",
        "rowNumber": 22,
        "kind": "subsection",
        "label": "Estrutura"
      },
      {
        "id": "loja-alimentacao-r23",
        "rowNumber": 23,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-alimentacao-r24",
        "rowNumber": 24,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r25",
        "rowNumber": 25,
        "kind": "subsection",
        "label": "Elétrico"
      },
      {
        "id": "loja-alimentacao-r26",
        "rowNumber": 26,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-alimentacao-r27",
        "rowNumber": 27,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r28",
        "rowNumber": 28,
        "kind": "subsection",
        "label": "CFTV e alarme de intrusão"
      },
      {
        "id": "loja-alimentacao-r29",
        "rowNumber": 29,
        "kind": "item",
        "label": "Projeto foi aprovado?"
      },
      {
        "id": "loja-alimentacao-r30",
        "rowNumber": 30,
        "kind": "subsection",
        "label": "Incêndio"
      },
      {
        "id": "loja-alimentacao-r31",
        "rowNumber": 31,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-alimentacao-r32",
        "rowNumber": 32,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r33",
        "rowNumber": 33,
        "kind": "subsection",
        "label": "Ar Condicionado"
      },
      {
        "id": "loja-alimentacao-r34",
        "rowNumber": 34,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-alimentacao-r35",
        "rowNumber": 35,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r36",
        "rowNumber": 36,
        "kind": "subsection",
        "label": "Hidrossanitário"
      },
      {
        "id": "loja-alimentacao-r37",
        "rowNumber": 37,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-alimentacao-r38",
        "rowNumber": 38,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r39",
        "rowNumber": 39,
        "kind": "subsection",
        "label": "Exaustão/CO²"
      },
      {
        "id": "loja-alimentacao-r40",
        "rowNumber": 40,
        "kind": "item",
        "label": "Projeto/Laudo está aprovado?"
      },
      {
        "id": "loja-alimentacao-r41",
        "rowNumber": 41,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r42",
        "rowNumber": 42,
        "kind": "subsection",
        "label": "Gás"
      },
      {
        "id": "loja-alimentacao-r43",
        "rowNumber": 43,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "loja-alimentacao-r44",
        "rowNumber": 44,
        "kind": "item",
        "label": "Foi entregue RRT?"
      },
      {
        "id": "loja-alimentacao-r45",
        "rowNumber": 45,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r46",
        "rowNumber": 46,
        "kind": "section",
        "label": "Arquitetura"
      },
      {
        "id": "loja-alimentacao-r47",
        "rowNumber": 47,
        "kind": "subsection",
        "label": "Fachada"
      },
      {
        "id": "loja-alimentacao-r48",
        "rowNumber": 48,
        "kind": "item",
        "label": "Avanço até o perfil divisório"
      },
      {
        "id": "loja-alimentacao-r49",
        "rowNumber": 49,
        "kind": "item",
        "label": "Acabamentos"
      },
      {
        "id": "loja-alimentacao-r50",
        "rowNumber": 50,
        "kind": "item",
        "label": "Pintura rodateto"
      },
      {
        "id": "loja-alimentacao-r51",
        "rowNumber": 51,
        "kind": "item",
        "label": "Pintura do forro na área do tapume"
      },
      {
        "id": "loja-alimentacao-r52",
        "rowNumber": 52,
        "kind": "item",
        "label": "Vidro da fachada limpo?"
      },
      {
        "id": "loja-alimentacao-r53",
        "rowNumber": 53,
        "kind": "subsection",
        "label": "Rodapé de Proteção de Fachada (h=20cm)"
      },
      {
        "id": "loja-alimentacao-r54",
        "rowNumber": 54,
        "kind": "item",
        "label": "Rodapé instalado?"
      },
      {
        "id": "loja-alimentacao-r55",
        "rowNumber": 55,
        "kind": "item",
        "label": "Rodapé limpo e conservado?"
      },
      {
        "id": "loja-alimentacao-r56",
        "rowNumber": 56,
        "kind": "subsection",
        "label": "Letreiro"
      },
      {
        "id": "loja-alimentacao-r57",
        "rowNumber": 57,
        "kind": "item",
        "label": "Letreiro instalado?"
      },
      {
        "id": "loja-alimentacao-r58",
        "rowNumber": 58,
        "kind": "subsection",
        "label": "Letreiro avançando apenas 15cm?"
      },
      {
        "id": "loja-alimentacao-r59",
        "rowNumber": 59,
        "kind": "item",
        "label": "Sem fiação exposta"
      },
      {
        "id": "loja-alimentacao-r60",
        "rowNumber": 60,
        "kind": "subsection",
        "label": "Desnível entre piso da Loja e do Mall"
      },
      {
        "id": "loja-alimentacao-r61",
        "rowNumber": 61,
        "kind": "item",
        "label": "Não há desnível ou obstáculo trepidante"
      },
      {
        "id": "loja-alimentacao-r62",
        "rowNumber": 62,
        "kind": "item",
        "label": "Pedra do Shopping quebrada?"
      },
      {
        "id": "loja-alimentacao-r63",
        "rowNumber": 63,
        "kind": "subsection",
        "label": "Alçapão e Portinhola"
      },
      {
        "id": "loja-alimentacao-r64",
        "rowNumber": 64,
        "kind": "item",
        "label": "Porta de enrolar"
      },
      {
        "id": "loja-alimentacao-r65",
        "rowNumber": 65,
        "kind": "subsection",
        "label": "Mobiliário"
      },
      {
        "id": "loja-alimentacao-r66",
        "rowNumber": 66,
        "kind": "item",
        "label": "Mobiliário instalado?"
      },
      {
        "id": "loja-alimentacao-r67",
        "rowNumber": 67,
        "kind": "subsection",
        "label": "Luminárias"
      },
      {
        "id": "loja-alimentacao-r68",
        "rowNumber": 68,
        "kind": "item",
        "label": "Luminárias instaladas?"
      },
      {
        "id": "loja-alimentacao-r69",
        "rowNumber": 69,
        "kind": "item",
        "label": "Acabamento em volta da luminária ok?"
      },
      {
        "id": "loja-alimentacao-r70",
        "rowNumber": 70,
        "kind": "subsection",
        "label": "Piso"
      },
      {
        "id": "loja-alimentacao-r71",
        "rowNumber": 71,
        "kind": "item",
        "label": "Rejunte com bom acabamento?"
      },
      {
        "id": "loja-alimentacao-r72",
        "rowNumber": 72,
        "kind": "subsection",
        "label": "Outros"
      },
      {
        "id": "loja-alimentacao-r73",
        "rowNumber": 73,
        "kind": "item",
        "label": "Eletrodomésticos"
      },
      {
        "id": "loja-alimentacao-r74",
        "rowNumber": 74,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r75",
        "rowNumber": 75,
        "kind": "section",
        "label": "Estrutura"
      },
      {
        "id": "loja-alimentacao-r76",
        "rowNumber": 76,
        "kind": "subsection",
        "label": "Escada Marinheiro"
      },
      {
        "id": "loja-alimentacao-r77",
        "rowNumber": 77,
        "kind": "item",
        "label": "Fixa no piso"
      },
      {
        "id": "loja-alimentacao-r78",
        "rowNumber": 78,
        "kind": "item",
        "label": "Barras avançando 1.40m"
      },
      {
        "id": "loja-alimentacao-r79",
        "rowNumber": 79,
        "kind": "subsection",
        "label": "Escada"
      },
      {
        "id": "loja-alimentacao-r80",
        "rowNumber": 80,
        "kind": "item",
        "label": "80cm livre"
      },
      {
        "id": "loja-alimentacao-r81",
        "rowNumber": 81,
        "kind": "item",
        "label": "Corrimão dos dois lados"
      },
      {
        "id": "loja-alimentacao-r82",
        "rowNumber": 82,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r83",
        "rowNumber": 83,
        "kind": "section",
        "label": "Elétrica"
      },
      {
        "id": "loja-alimentacao-r84",
        "rowNumber": 84,
        "kind": "subsection",
        "label": "Iluminação de Emergência"
      },
      {
        "id": "loja-alimentacao-r85",
        "rowNumber": 85,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r86",
        "rowNumber": 86,
        "kind": "item",
        "label": "Instaladas?"
      },
      {
        "id": "loja-alimentacao-r87",
        "rowNumber": 87,
        "kind": "subsection",
        "label": "Medidor de Energia Instalado"
      },
      {
        "id": "loja-alimentacao-r88",
        "rowNumber": 88,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r89",
        "rowNumber": 89,
        "kind": "field",
        "label": "Medição do medidor:"
      },
      {
        "id": "loja-alimentacao-r90",
        "rowNumber": 90,
        "kind": "subsection",
        "label": "QDL"
      },
      {
        "id": "loja-alimentacao-r91",
        "rowNumber": 91,
        "kind": "item",
        "label": "Testados todos os circuitos  ?"
      },
      {
        "id": "loja-alimentacao-r92",
        "rowNumber": 92,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r93",
        "rowNumber": 93,
        "kind": "item",
        "label": "Enumeração e identificação dos circuitos?"
      },
      {
        "id": "loja-alimentacao-r94",
        "rowNumber": 94,
        "kind": "item",
        "label": "Proteção do quadro?"
      },
      {
        "id": "loja-alimentacao-r95",
        "rowNumber": 95,
        "kind": "item",
        "label": "Existe Disjuntor DR (Diferencial Residual)?"
      },
      {
        "id": "loja-alimentacao-r96",
        "rowNumber": 96,
        "kind": "item",
        "label": "Existe Disjuntor DG?"
      },
      {
        "id": "loja-alimentacao-r97",
        "rowNumber": 97,
        "kind": "item",
        "label": "Possui timer?"
      },
      {
        "id": "loja-alimentacao-r98",
        "rowNumber": 98,
        "kind": "item",
        "label": "Limpeza do quadro?"
      },
      {
        "id": "loja-alimentacao-r99",
        "rowNumber": 99,
        "kind": "item",
        "label": "Aterramento do quadro?"
      },
      {
        "id": "loja-alimentacao-r100",
        "rowNumber": 100,
        "kind": "item",
        "label": "Aterramento da tampa?"
      },
      {
        "id": "loja-alimentacao-r101",
        "rowNumber": 101,
        "kind": "item",
        "label": "Barramento de Neutro?"
      },
      {
        "id": "loja-alimentacao-r102",
        "rowNumber": 102,
        "kind": "item",
        "label": "Barramento de Terra?"
      },
      {
        "id": "loja-alimentacao-r103",
        "rowNumber": 103,
        "kind": "item",
        "label": "Fixação de cabeamentos?"
      },
      {
        "id": "loja-alimentacao-r104",
        "rowNumber": 104,
        "kind": "item",
        "label": "Seletividade de disjuntores?"
      },
      {
        "id": "loja-alimentacao-r105",
        "rowNumber": 105,
        "kind": "item",
        "label": "Organização de cabeamento?"
      },
      {
        "id": "loja-alimentacao-r106",
        "rowNumber": 106,
        "kind": "item",
        "label": "Unifilar na porta?"
      },
      {
        "id": "loja-alimentacao-r107",
        "rowNumber": 107,
        "kind": "item",
        "label": "Proteção interna fixada?"
      },
      {
        "id": "loja-alimentacao-r108",
        "rowNumber": 108,
        "kind": "item",
        "label": "Quadro fixado?"
      },
      {
        "id": "loja-alimentacao-r109",
        "rowNumber": 109,
        "kind": "item",
        "label": "Todos os cabos com terminais?"
      },
      {
        "id": "loja-alimentacao-r110",
        "rowNumber": 110,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r111",
        "rowNumber": 111,
        "kind": "section",
        "label": "Telefonia"
      },
      {
        "id": "loja-alimentacao-r112",
        "rowNumber": 112,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r113",
        "rowNumber": 113,
        "kind": "item",
        "label": "Testada a rede telefônica"
      },
      {
        "id": "loja-alimentacao-r114",
        "rowNumber": 114,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r115",
        "rowNumber": 115,
        "kind": "section",
        "label": "Alarme de Intrusão e Sensor de Presença"
      },
      {
        "id": "loja-alimentacao-r116",
        "rowNumber": 116,
        "kind": "item",
        "label": "Instalado?"
      },
      {
        "id": "loja-alimentacao-r117",
        "rowNumber": 117,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r118",
        "rowNumber": 118,
        "kind": "section",
        "label": "Gás"
      },
      {
        "id": "loja-alimentacao-r119",
        "rowNumber": 119,
        "kind": "subsection",
        "label": "Medidor instalado"
      },
      {
        "id": "loja-alimentacao-r120",
        "rowNumber": 120,
        "kind": "subsection",
        "label": "Instalado detector de vazamento"
      },
      {
        "id": "loja-alimentacao-r121",
        "rowNumber": 121,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r122",
        "rowNumber": 122,
        "kind": "section",
        "label": "Hidrossanitário"
      },
      {
        "id": "loja-alimentacao-r123",
        "rowNumber": 123,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r124",
        "rowNumber": 124,
        "kind": "item",
        "label": "Hidrômetro instalado"
      },
      {
        "id": "loja-alimentacao-r125",
        "rowNumber": 125,
        "kind": "field",
        "label": "Medição do hidrômetro:"
      },
      {
        "id": "loja-alimentacao-r126",
        "rowNumber": 126,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r127",
        "rowNumber": 127,
        "kind": "section",
        "label": "Combate à incêndio"
      },
      {
        "id": "loja-alimentacao-r128",
        "rowNumber": 128,
        "kind": "subsection",
        "label": "Teste de Estanquiedade"
      },
      {
        "id": "loja-alimentacao-r129",
        "rowNumber": 129,
        "kind": "item",
        "label": "Efetuado teste de Estanqueidade?"
      },
      {
        "id": "loja-alimentacao-r130",
        "rowNumber": 130,
        "kind": "item",
        "label": "Teste de Estanquiedade aprovado?"
      },
      {
        "id": "loja-alimentacao-r131",
        "rowNumber": 131,
        "kind": "item",
        "label": "Emitido Laudo?"
      },
      {
        "id": "loja-alimentacao-r132",
        "rowNumber": 132,
        "kind": "subsection",
        "label": "Detectores de fumaça"
      },
      {
        "id": "loja-alimentacao-r133",
        "rowNumber": 133,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r134",
        "rowNumber": 134,
        "kind": "item",
        "label": "Detectores de fumaça instalados?"
      },
      {
        "id": "loja-alimentacao-r135",
        "rowNumber": 135,
        "kind": "item",
        "label": "Acionador Manual"
      },
      {
        "id": "loja-alimentacao-r136",
        "rowNumber": 136,
        "kind": "item",
        "label": "Central instalada?"
      },
      {
        "id": "loja-alimentacao-r137",
        "rowNumber": 137,
        "kind": "item",
        "label": "Central apresenta falha?"
      },
      {
        "id": "loja-alimentacao-r138",
        "rowNumber": 138,
        "kind": "subsection",
        "label": "Extintores"
      },
      {
        "id": "loja-alimentacao-r139",
        "rowNumber": 139,
        "kind": "item",
        "label": "Extintor desobstruído?"
      },
      {
        "id": "loja-alimentacao-r140",
        "rowNumber": 140,
        "kind": "item",
        "label": "Extintor sinalizado?"
      },
      {
        "id": "loja-alimentacao-r141",
        "rowNumber": 141,
        "kind": "item",
        "label": "Quantidade de extintores conforme projeto?"
      },
      {
        "id": "loja-alimentacao-r142",
        "rowNumber": 142,
        "kind": "item",
        "label": "Extintores fixados em suporte ou tripé?"
      },
      {
        "id": "loja-alimentacao-r143",
        "rowNumber": 143,
        "kind": "item",
        "label": "Extintores com validade e carga conforme?"
      },
      {
        "id": "loja-alimentacao-r144",
        "rowNumber": 144,
        "kind": "item",
        "label": "Sinalização de rota de fuga e saída de emergência conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r145",
        "rowNumber": 145,
        "kind": "item",
        "label": "Placas de sinalização de emergência com CNPJ do fabricante e fator de luminosidade?"
      },
      {
        "id": "loja-alimentacao-r146",
        "rowNumber": 146,
        "kind": "item",
        "label": "Altura das placas de extintores e de emergência a 1,80M?"
      },
      {
        "id": "loja-alimentacao-r147",
        "rowNumber": 147,
        "kind": "subsection",
        "label": "Sprinkler"
      },
      {
        "id": "loja-alimentacao-r148",
        "rowNumber": 148,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r149",
        "rowNumber": 149,
        "kind": "item",
        "label": "Ponto em todos os ambientes?"
      },
      {
        "id": "loja-alimentacao-r150",
        "rowNumber": 150,
        "kind": "item",
        "label": "Bicos obstruídos?"
      },
      {
        "id": "loja-alimentacao-r151",
        "rowNumber": 151,
        "kind": "item",
        "label": "Classificação de bico de SPK conforme projeto"
      },
      {
        "id": "loja-alimentacao-r152",
        "rowNumber": 152,
        "kind": "item",
        "label": "Materiais pendurados nos bicos de SPK"
      },
      {
        "id": "loja-alimentacao-r153",
        "rowNumber": 153,
        "kind": "item",
        "label": "Tubulação pintada conforme norma"
      },
      {
        "id": "loja-alimentacao-r154",
        "rowNumber": 154,
        "kind": "item",
        "label": "Bicos de SPK antigos e desgastados"
      },
      {
        "id": "loja-alimentacao-r155",
        "rowNumber": 155,
        "kind": "item",
        "label": "Área de atuação de SPK obstruída"
      },
      {
        "id": "loja-alimentacao-r156",
        "rowNumber": 156,
        "kind": "item",
        "label": "Dreno de SPK com válvula e altura adequada (1.60m)"
      },
      {
        "id": "loja-alimentacao-r157",
        "rowNumber": 157,
        "kind": "item",
        "label": "Dreno de SPK possui manômetro e tapes na extremidade"
      },
      {
        "id": "loja-alimentacao-r158",
        "rowNumber": 158,
        "kind": "item",
        "label": "Válvula tipo esfera de SPK está aberta?"
      },
      {
        "id": "loja-alimentacao-r159",
        "rowNumber": 159,
        "kind": "item",
        "label": "As placas de sinalização de incêndio da loja estão de acordo com a legislação vigente?"
      },
      {
        "id": "loja-alimentacao-r160",
        "rowNumber": 160,
        "kind": "item",
        "label": "Existe SPK no entreforro?"
      },
      {
        "id": "loja-alimentacao-r161",
        "rowNumber": 161,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r162",
        "rowNumber": 162,
        "kind": "section",
        "label": "Ar-condicionado"
      },
      {
        "id": "loja-alimentacao-r163",
        "rowNumber": 163,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "loja-alimentacao-r164",
        "rowNumber": 164,
        "kind": "subsection",
        "label": "Temperatura na Loja - Hora Verificação"
      },
      {
        "id": "loja-alimentacao-r165",
        "rowNumber": 165,
        "kind": "subsection",
        "label": "Temperatura de saída"
      },
      {
        "id": "loja-alimentacao-r166",
        "rowNumber": 166,
        "kind": "subsection",
        "label": "Temperatura de entrada"
      },
      {
        "id": "loja-alimentacao-r167",
        "rowNumber": 167,
        "kind": "item",
        "label": "Plataforma de Manutenção"
      },
      {
        "id": "loja-alimentacao-r168",
        "rowNumber": 168,
        "kind": "item",
        "label": "Espaço para manutenção fancoil (2 lados 60cm; 2 lados 40cm)"
      },
      {
        "id": "loja-alimentacao-r169",
        "rowNumber": 169,
        "kind": "item",
        "label": "Grelhas e difusores instalados"
      },
      {
        "id": "loja-alimentacao-r170",
        "rowNumber": 170,
        "kind": "item",
        "label": "Termômetros"
      },
      {
        "id": "loja-alimentacao-r171",
        "rowNumber": 171,
        "kind": "item",
        "label": "Manômetros"
      },
      {
        "id": "loja-alimentacao-r172",
        "rowNumber": 172,
        "kind": "item",
        "label": "Válvula 2 vias de controle"
      },
      {
        "id": "loja-alimentacao-r173",
        "rowNumber": 173,
        "kind": "item",
        "label": "Termostato para controle"
      },
      {
        "id": "loja-alimentacao-r174",
        "rowNumber": 174,
        "kind": "item",
        "label": "Válvulas de bloqueio"
      },
      {
        "id": "loja-alimentacao-r175",
        "rowNumber": 175,
        "kind": "item",
        "label": "Filtro Y"
      },
      {
        "id": "loja-alimentacao-r176",
        "rowNumber": 176,
        "kind": "item",
        "label": "Condições dos filtros"
      },
      {
        "id": "loja-alimentacao-r177",
        "rowNumber": 177,
        "kind": "item",
        "label": "Bandeja"
      },
      {
        "id": "loja-alimentacao-r178",
        "rowNumber": 178,
        "kind": "item",
        "label": "Serpentina"
      },
      {
        "id": "loja-alimentacao-r179",
        "rowNumber": 179,
        "kind": "item",
        "label": "Isolamento elastomérico da tubulação de AG"
      },
      {
        "id": "loja-alimentacao-r180",
        "rowNumber": 180,
        "kind": "item",
        "label": "Dreno água gelada"
      },
      {
        "id": "loja-alimentacao-r181",
        "rowNumber": 181,
        "kind": "item",
        "label": "Dreno água gelada saída"
      },
      {
        "id": "loja-alimentacao-r182",
        "rowNumber": 182,
        "kind": "item",
        "label": "Duto de insuflamento"
      },
      {
        "id": "loja-alimentacao-r183",
        "rowNumber": 183,
        "kind": "item",
        "label": "Duto de Retorno"
      },
      {
        "id": "loja-alimentacao-r184",
        "rowNumber": 184,
        "kind": "item",
        "label": "Duto de Renovação"
      },
      {
        "id": "loja-alimentacao-r185",
        "rowNumber": 185,
        "kind": "item",
        "label": "Instalação elétrica do motor"
      },
      {
        "id": "loja-alimentacao-r186",
        "rowNumber": 186,
        "kind": "item",
        "label": "Interligação do dreno no retorno da água gelada com o esgoto do Shopping?"
      },
      {
        "id": "loja-alimentacao-r187",
        "rowNumber": 187,
        "kind": "item",
        "label": "Dreno com sifão?"
      },
      {
        "id": "loja-alimentacao-r188",
        "rowNumber": 188,
        "kind": "item",
        "label": "Casa de máquinas estanque?"
      },
      {
        "id": "loja-alimentacao-r189",
        "rowNumber": 189,
        "kind": "item",
        "label": "Realizado o teste de impermeabilização da casa de máquinas?"
      },
      {
        "id": "loja-alimentacao-r190",
        "rowNumber": 190,
        "kind": "item",
        "label": "Válvula de água gelada aberta?"
      },
      {
        "id": "loja-alimentacao-r191",
        "rowNumber": 191,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r192",
        "rowNumber": 192,
        "kind": "section",
        "label": "Exaustão/CO²"
      },
      {
        "id": "loja-alimentacao-r193",
        "rowNumber": 193,
        "kind": "item",
        "label": "Ventiladores conforme normas"
      },
      {
        "id": "loja-alimentacao-r194",
        "rowNumber": 194,
        "kind": "subsection",
        "label": "Coifa lavadora"
      },
      {
        "id": "loja-alimentacao-r195",
        "rowNumber": 195,
        "kind": "subsection",
        "label": "Vazão conforme projeto"
      },
      {
        "id": "loja-alimentacao-r196",
        "rowNumber": 196,
        "kind": "subsection",
        "label": "Damper corta-fogo"
      },
      {
        "id": "loja-alimentacao-r197",
        "rowNumber": 197,
        "kind": "item",
        "label": "Isolamento"
      },
      {
        "id": "loja-alimentacao-r198",
        "rowNumber": 198,
        "kind": "item",
        "label": "CO² fixo"
      },
      {
        "id": "loja-alimentacao-r199",
        "rowNumber": 199,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "loja-alimentacao-r200",
        "rowNumber": 200,
        "kind": "section",
        "label": "Preparação para Loja"
      },
      {
        "id": "loja-alimentacao-r201",
        "rowNumber": 201,
        "kind": "item",
        "label": "Loja Concluída"
      },
      {
        "id": "loja-alimentacao-r202",
        "rowNumber": 202,
        "kind": "item",
        "label": "Limpeza Efetuada"
      },
      {
        "id": "loja-alimentacao-r204",
        "rowNumber": 204,
        "kind": "field",
        "label": "PRAZO PARA SOLUÇÃO DAS PENDÊNCIAS:"
      },
      {
        "id": "loja-alimentacao-r205",
        "rowNumber": 205,
        "kind": "field",
        "label": "RESPONSÁVEL PELA LOJA:"
      },
      {
        "id": "loja-alimentacao-r206",
        "rowNumber": 206,
        "kind": "field",
        "label": "RESPONSÁVEL PELA OBRA:"
      },
      {
        "id": "loja-alimentacao-r207",
        "rowNumber": 207,
        "kind": "field",
        "label": "QUALIDADE - SHOPPING RIO POTY:"
      },
      {
        "id": "loja-alimentacao-r208",
        "rowNumber": 208,
        "kind": "field",
        "label": "MANUTENÇÃO - SHOPPING RIO POTY:"
      },
      {
        "id": "loja-alimentacao-r209",
        "rowNumber": 209,
        "kind": "field",
        "label": "BRIGADA - SHOPPING RIO POTY:"
      }
    ]
  },
  {
    "id": "quiosque",
    "label": "Vistoria Final em Obras de Quiosque",
    "sourceSheet": "Vistoria Quiosques",
    "codeLabel": "Q",
    "totalItems": 38,
    "header": [
      {
        "rowNumber": 3,
        "left": "Q:",
        "right": "Data:"
      },
      {
        "rowNumber": 4,
        "left": "Nome Fantasia:",
        "right": "Vistoria:"
      },
      {
        "rowNumber": 5,
        "left": "Empresas:",
        "right": ""
      },
      {
        "rowNumber": 6,
        "left": "Data de início da montagm:",
        "right": "Inauguração"
      },
      {
        "rowNumber": 7,
        "left": "Documentos",
        "right": "NA"
      }
    ],
    "rows": [
      {
        "id": "quiosque-r7",
        "rowNumber": 7,
        "kind": "section",
        "label": "Documentos"
      },
      {
        "id": "quiosque-r8",
        "rowNumber": 8,
        "kind": "subsection",
        "label": "Documentos"
      },
      {
        "id": "quiosque-r9",
        "rowNumber": 9,
        "kind": "item",
        "label": "RRT de Projeto de Arquitetura"
      },
      {
        "id": "quiosque-r10",
        "rowNumber": 10,
        "kind": "item",
        "label": "ART de Execução de Montagem"
      },
      {
        "id": "quiosque-r11",
        "rowNumber": 11,
        "kind": "item",
        "label": "ART de Projeto de Elétrica"
      },
      {
        "id": "quiosque-r12",
        "rowNumber": 12,
        "kind": "item",
        "label": "ART de Execução de Elétrica"
      },
      {
        "id": "quiosque-r13",
        "rowNumber": 13,
        "kind": "item",
        "label": "ART de Projeto de Hidráulica"
      },
      {
        "id": "quiosque-r14",
        "rowNumber": 14,
        "kind": "item",
        "label": "ART de Execução de Hidráulica"
      },
      {
        "id": "quiosque-r15",
        "rowNumber": 15,
        "kind": "item",
        "label": "Seguro de montagem"
      },
      {
        "id": "quiosque-r16",
        "rowNumber": 16,
        "kind": "section",
        "label": "Projetos"
      },
      {
        "id": "quiosque-r17",
        "rowNumber": 17,
        "kind": "subsection",
        "label": "Arquitetura"
      },
      {
        "id": "quiosque-r18",
        "rowNumber": 18,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "quiosque-r19",
        "rowNumber": 19,
        "kind": "item",
        "label": "O layout apresentado é compativel com o do projeto aprovado?"
      },
      {
        "id": "quiosque-r20",
        "rowNumber": 20,
        "kind": "subsection",
        "label": "Elétrico"
      },
      {
        "id": "quiosque-r21",
        "rowNumber": 21,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "quiosque-r22",
        "rowNumber": 22,
        "kind": "subsection",
        "label": "Hidráulica"
      },
      {
        "id": "quiosque-r23",
        "rowNumber": 23,
        "kind": "item",
        "label": "Projeto está aprovado?"
      },
      {
        "id": "quiosque-r24",
        "rowNumber": 24,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "quiosque-r25",
        "rowNumber": 25,
        "kind": "section",
        "label": "Arquitetura"
      },
      {
        "id": "quiosque-r26",
        "rowNumber": 26,
        "kind": "subsection",
        "label": "Instalação"
      },
      {
        "id": "quiosque-r27",
        "rowNumber": 27,
        "kind": "item",
        "label": "Instalado centralizado de acordo com posicionamento demarcado"
      },
      {
        "id": "quiosque-r28",
        "rowNumber": 28,
        "kind": "subsection",
        "label": "Dimensionamento"
      },
      {
        "id": "quiosque-r29",
        "rowNumber": 29,
        "kind": "item",
        "label": "Largura e comprimento de acordo com o projeto"
      },
      {
        "id": "quiosque-r30",
        "rowNumber": 30,
        "kind": "item",
        "label": "Altura do balcão não ultrapassa 1,10m"
      },
      {
        "id": "quiosque-r31",
        "rowNumber": 31,
        "kind": "item",
        "label": "Altura de uma das laterais não ultrapassa 1,40m"
      },
      {
        "id": "quiosque-r32",
        "rowNumber": 32,
        "kind": "subsection",
        "label": "Tablado"
      },
      {
        "id": "quiosque-r33",
        "rowNumber": 33,
        "kind": "item",
        "label": "Tablado de 5cm de altura instalado sob toda a área do quiosque"
      },
      {
        "id": "quiosque-r34",
        "rowNumber": 34,
        "kind": "item",
        "label": "Borracha de 5mm instalada sob todo o tablado"
      },
      {
        "id": "quiosque-r35",
        "rowNumber": 35,
        "kind": "item",
        "label": "Possui rampa de acesso ao público com piso antiderrapante"
      },
      {
        "id": "quiosque-r36",
        "rowNumber": 36,
        "kind": "subsection",
        "label": "Letreiro"
      },
      {
        "id": "quiosque-r37",
        "rowNumber": 37,
        "kind": "item",
        "label": "Letreiro instalado?"
      },
      {
        "id": "quiosque-r38",
        "rowNumber": 38,
        "kind": "item",
        "label": "Letreiro vertical com dimensões máximas de 1,60m x 0,40m, ou área de 0,40m x 0,40m"
      },
      {
        "id": "quiosque-r39",
        "rowNumber": 39,
        "kind": "item",
        "label": "Letreiro horizontal com dimensões máximas de 0,30m x 0,40m"
      },
      {
        "id": "quiosque-r40",
        "rowNumber": 40,
        "kind": "item",
        "label": "Iluminação do letreiro é de baixa intensidade, com material translúcido"
      },
      {
        "id": "quiosque-r41",
        "rowNumber": 41,
        "kind": "subsection",
        "label": "Alçapão"
      },
      {
        "id": "quiosque-r42",
        "rowNumber": 42,
        "kind": "item",
        "label": "Possui alçapão com dimensão mínima de 30x30cm"
      },
      {
        "id": "quiosque-r43",
        "rowNumber": 43,
        "kind": "subsection",
        "label": "Mobiliário"
      },
      {
        "id": "quiosque-r44",
        "rowNumber": 44,
        "kind": "item",
        "label": "Mobiliário interno instalado conforme projeto"
      },
      {
        "id": "quiosque-r45",
        "rowNumber": 45,
        "kind": "item",
        "label": "Mobiliário externo instalado conforme projeto"
      },
      {
        "id": "quiosque-r46",
        "rowNumber": 46,
        "kind": "subsection",
        "label": "Luminárias"
      },
      {
        "id": "quiosque-r47",
        "rowNumber": 47,
        "kind": "item",
        "label": "Luminárias instaladas?"
      },
      {
        "id": "quiosque-r48",
        "rowNumber": 48,
        "kind": "item",
        "label": "Não há lâmpadas aparentes dentro da vitrine do quiosque"
      },
      {
        "id": "quiosque-r49",
        "rowNumber": 49,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "quiosque-r50",
        "rowNumber": 50,
        "kind": "section",
        "label": "Elétrica"
      },
      {
        "id": "quiosque-r51",
        "rowNumber": 51,
        "kind": "subsection",
        "label": "Medidor de Energia"
      },
      {
        "id": "quiosque-r52",
        "rowNumber": 52,
        "kind": "item",
        "label": "Apresenta Medidor de Energia conforme projeto aprovado"
      },
      {
        "id": "quiosque-r53",
        "rowNumber": 53,
        "kind": "field",
        "label": "Medição do medidor:"
      },
      {
        "id": "quiosque-r54",
        "rowNumber": 54,
        "kind": "subsection",
        "label": "Fiação"
      },
      {
        "id": "quiosque-r55",
        "rowNumber": 55,
        "kind": "item",
        "label": "Não há fios expostos"
      },
      {
        "id": "quiosque-r56",
        "rowNumber": 56,
        "kind": "item",
        "label": "Toda a fiação está protegida"
      },
      {
        "id": "quiosque-r57",
        "rowNumber": 57,
        "kind": "subsection",
        "label": "Quadro de Energia"
      },
      {
        "id": "quiosque-r58",
        "rowNumber": 58,
        "kind": "item",
        "label": "Enumeração e identificação dos circuitos?"
      },
      {
        "id": "quiosque-r59",
        "rowNumber": 59,
        "kind": "item",
        "label": "Proteção do quadro?"
      },
      {
        "id": "quiosque-r60",
        "rowNumber": 60,
        "kind": "item",
        "label": "Existe Disjuntor DR (Diferencial Residual)?"
      },
      {
        "id": "quiosque-r61",
        "rowNumber": 61,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "quiosque-r62",
        "rowNumber": 62,
        "kind": "section",
        "label": "Hidrossanitário"
      },
      {
        "id": "quiosque-r63",
        "rowNumber": 63,
        "kind": "item",
        "label": "Execução conforme projeto aprovado?"
      },
      {
        "id": "quiosque-r64",
        "rowNumber": 64,
        "kind": "item",
        "label": "Hidrômetro instalado"
      },
      {
        "id": "quiosque-r65",
        "rowNumber": 65,
        "kind": "field",
        "label": "Medição do hidrômetro:"
      },
      {
        "id": "quiosque-r66",
        "rowNumber": 66,
        "kind": "item",
        "label": "Caixa de Gordura instalada"
      },
      {
        "id": "quiosque-r67",
        "rowNumber": 67,
        "kind": "note",
        "label": "Observações:"
      },
      {
        "id": "quiosque-r68",
        "rowNumber": 68,
        "kind": "section",
        "label": "PREPARAÇÃO DO QUIOSQUE"
      },
      {
        "id": "quiosque-r69",
        "rowNumber": 69,
        "kind": "item",
        "label": "Loja Concluída"
      },
      {
        "id": "quiosque-r70",
        "rowNumber": 70,
        "kind": "item",
        "label": "Limpeza Efetuada"
      },
      {
        "id": "quiosque-r72",
        "rowNumber": 72,
        "kind": "field",
        "label": "PRAZO PARA SOLUÇÃO DAS PENDÊNCIAS:"
      },
      {
        "id": "quiosque-r73",
        "rowNumber": 73,
        "kind": "field",
        "label": "RESPONSÁVEL PELO QUIOSQUE:"
      },
      {
        "id": "quiosque-r74",
        "rowNumber": 74,
        "kind": "field",
        "label": "QUALIDADE - SHOPPING DA MESTRE ÁLVARO:"
      },
      {
        "id": "quiosque-r75",
        "rowNumber": 75,
        "kind": "field",
        "label": "MANUTENÇÃO - SHOPPING DA MESTRE ÁLVARO:"
      }
    ]
  }
];
