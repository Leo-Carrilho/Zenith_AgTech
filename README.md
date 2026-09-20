# Zenith

> **Sua precisão agrícola no ponto mais alto.**

O **Zenith** é uma plataforma digital voltada ao monitoramento e à gestão de lavouras de soja, integrando **Inteligência Artificial, Visão Computacional, Agricultura de Precisão, drones e ferramentas de gestão agrícola** em um único ecossistema.

🌐 **Site oficial:** [www.zenithagro.com.br](https://www.zenithagro.com.br)

---

## Sobre o Projeto

O Zenith foi desenvolvido com o objetivo de tornar tecnologias de **Agricultura de Precisão** mais acessíveis, principalmente para pequenos e médios produtores rurais.

A plataforma reúne recursos para monitoramento da lavoura, diagnóstico de imagens, gestão da propriedade, acompanhamento climático e análise de dados, buscando transformar informações coletadas no campo em dados mais claros para auxiliar a tomada de decisões.

O projeto combina diferentes tecnologias, como **Progressive Web Application (PWA), APIs REST, Inteligência Artificial, Visão Computacional, fotogrametria e serviços em nuvem**.

O Zenith atua como uma ferramenta de apoio ao produtor e aos profissionais da área agrícola, não substituindo avaliações técnicas ou decisões agronômicas realizadas por profissionais qualificados.

---

## Problema Identificado

A produção de soja possui grande relevância para o agronegócio brasileiro, porém parte significativa do monitoramento das lavouras ainda depende de inspeções visuais e processos manuais.

Esse cenário pode dificultar:

* a identificação antecipada de pragas e doenças;
* a localização de irregularidades no plantio;
* o acompanhamento de grandes áreas;
* a organização das informações da propriedade;
* o uso eficiente de insumos;
* a análise rápida de dados agrícolas;
* a tomada de decisões baseada em informações atualizadas.

Além disso, soluções avançadas de Agricultura de Precisão podem apresentar custos ou níveis de complexidade que dificultam sua adoção por propriedades de menor porte.

---

## Objetivo

Desenvolver uma plataforma digital integrada capaz de utilizar **Inteligência Artificial, Visão Computacional, imagens aéreas e ferramentas de gestão** para apoiar o monitoramento de lavouras de soja e facilitar o acesso a recursos de Agricultura de Precisão.

---

# Funcionalidades

## Central de Operações

A Central de Operações reúne os principais módulos da propriedade em uma única interface.

Entre os recursos disponíveis estão:

* informações climáticas;
* gerenciamento da propriedade;
* visualização de áreas e talhões;
* controle de estoque;
* diário de campo;
* gerenciamento de atividades;
* gestão da equipe;
* acesso aos módulos inteligentes da plataforma.

---

## Monitoramento Climático

Permite consultar informações meteorológicas relevantes para o planejamento das atividades agrícolas.

### Recursos

* consulta de condições climáticas;
* integração com serviços meteorológicos externos;
* acompanhamento de informações da região;
* apoio ao planejamento das atividades realizadas no campo.

---

## Controle de Estoque

Ferramenta destinada à organização dos recursos utilizados na propriedade.

### Recursos

* cadastro de produtos e insumos;
* registro de entradas e saídas;
* acompanhamento da quantidade disponível;
* organização do estoque da propriedade.

---

## Diário de Campo

Permite registrar e consultar atividades realizadas durante o manejo da lavoura.

### Recursos

* registro de atividades agrícolas;
* histórico operacional;
* organização das informações de manejo;
* acompanhamento das ações realizadas na propriedade.

---

## Gestão de Atividades e Equipe

A plataforma permite organizar atividades relacionadas à propriedade e acompanhar sua execução.

### Recursos

* criação de atividades;
* organização de tarefas;
* acompanhamento das operações;
* gerenciamento de integrantes da equipe.

---

# Inteligência Artificial

## Diagnóstico de Folhas

O Zenith possui um módulo de diagnóstico baseado em **Redes Neurais Convolucionais (CNN)** utilizando a arquitetura **EfficientNetB3**.

O modelo analisa imagens de folhas de soja e identifica padrões relacionados às classes atualmente utilizadas no projeto:

* **Ferrugem asiática**
* **Cercosporiose**
* **Lagartas**
* **Soja saudável**

As imagens podem ser selecionadas diretamente no dispositivo ou obtidas durante atividades de monitoramento.

Após o envio, uma API específica realiza o processamento e retorna o resultado para a plataforma.

> O diagnóstico automatizado funciona como ferramenta de triagem e apoio. A confirmação de doenças, pragas ou outras condições da cultura deve considerar avaliação técnica especializada.

---

## Visão Computacional

Além do diagnóstico de folhas, o projeto utiliza técnicas de **Visão Computacional** para análise de características da plantação.

Entre as aplicações estudadas estão:

* identificação de irregularidades;
* análise da distribuição das plantas;
* avaliação de densidade;
* identificação de possíveis falhas no plantio;
* análise do alinhamento de fileiras;
* processamento de imagens obtidas no campo.

---

# Integração com Drones

Os drones são utilizados como plataformas para obtenção de imagens aéreas das áreas agrícolas.

Essas imagens podem posteriormente ser processadas pelos diferentes módulos do Zenith.

### Aplicações

* captura de imagens aéreas;
* monitoramento de áreas agrícolas;
* inspeção remota da lavoura;
* geração de dados para Visão Computacional;
* obtenção de conjuntos de imagens para reconstrução tridimensional.

O projeto atualmente considera drones principalmente para **monitoramento e aquisição de imagens**, não para pulverização agrícola.

---

# Reconstrução 3D

O Zenith possui um módulo experimental de reconstrução tridimensional utilizando **fotogrametria**.

O processamento é realizado por meio do **WebODM**, utilizando técnicas baseadas em *Structure from Motion* (SfM).

### Fluxo simplificado

```text
Imagens do voo
      ↓
Upload para a plataforma
      ↓
API FastAPI
      ↓
Processamento fotogramétrico
      ↓
WebODM
      ↓
Modelo tridimensional
      ↓
Visualização no Zenith
```

O conjunto de fotografias capturadas de diferentes posições permite reconstruir digitalmente características da área monitorada.

A integração com o serviço fotogramétrico é realizada por uma API independente, evitando a exposição direta de credenciais e serviços internos ao navegador.

---

# Mapa e Propriedades

A plataforma possui recursos para organização e visualização das propriedades cadastradas.

Entre as funcionalidades estudadas e implementadas estão:

* cadastro da propriedade;
* visualização da área;
* organização por talhões;
* representação geográfica;
* integração com recursos de mapas;
* associação de informações agrícolas às áreas cadastradas.

---

# Arquitetura da Solução

O Zenith utiliza uma arquitetura baseada em **serviços independentes**, permitindo separar as diferentes responsabilidades do sistema.

```text
                    ┌───────────────────────┐
                    │        Usuário        │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │      Zenith PWA       │
                    │    React + Vite       │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
       │ Diagnóstico │   │ Monitoramento│   │Reconstrução │
       │     IA      │   │ / Visão Comp.│   │     3D      │
       │   FastAPI   │   │   FastAPI    │   │   FastAPI   │
       └──────┬──────┘   └──────────────┘   └──────┬──────┘
              │                                     │
              ▼                                     ▼
      ┌───────────────┐                      ┌───────────────┐
      │ EfficientNetB3│                      │    WebODM     │
      └───────────────┘                      └───────────────┘

                    ┌───────────────────────┐
                    │       Firebase        │
                    │ Auth + Firestore      │
                    └───────────────────────┘
```

Essa estrutura permite que os módulos sejam desenvolvidos e aprimorados de maneira independente.

---

# Tecnologias Utilizadas

## Front-end

* React
* Vite
* JavaScript
* HTML
* CSS
* Progressive Web Application (PWA)

## Back-end

* Python
* FastAPI
* APIs REST
* JSON

## Banco de Dados e Autenticação

* Firebase
* Firebase Authentication
* Cloud Firestore
* Banco de dados NoSQL

## Inteligência Artificial

* TensorFlow
* EfficientNetB3
* Redes Neurais Convolucionais (CNN)
* Visão Computacional
* Python

## Processamento 3D

* WebODM
* Fotogrametria
* Structure from Motion (SfM)

## Infraestrutura e Desenvolvimento

* Docker
* Git
* GitHub
* Visual Studio Code
* Node.js

## Metodologia

* Scrum
* Pesquisa aplicada
* Desenvolvimento experimental

---

# Progressive Web Application

A interface principal do Zenith foi desenvolvida como uma **Progressive Web Application (PWA)**.

Essa abordagem permite disponibilizar uma experiência semelhante à de uma aplicação instalada diretamente pelo navegador em dispositivos compatíveis.

Entre as características utilizadas estão:

* interface responsiva;
* instalação pelo navegador em ambientes compatíveis;
* cache de recursos;
* carregamento otimizado;
* estrutura adaptável a diferentes dispositivos;
* maior resiliência em cenários de conectividade limitada.

---

# Fluxo de Funcionamento

De forma simplificada, o funcionamento dos módulos de monitoramento ocorre da seguinte maneira:

```text
Coleta de imagens
        ↓
Celular / Câmera / Drone
        ↓
Envio para a plataforma
        ↓
Processamento
        ↓
IA / Visão Computacional / Fotogrametria
        ↓
Diagnósticos e representações
        ↓
Informações para acompanhamento da lavoura
        ↓
Central de Operações
```

As imagens podem ser obtidas por diferentes dispositivos e posteriormente transformadas em diagnósticos, indicadores ou representações visuais.

---

# Resultados Preliminares

Durante os testes realizados no desenvolvimento do módulo de diagnóstico por Inteligência Artificial, foram obtidos os seguintes resultados preliminares:

| Indicador               | Resultado                                     |
| ----------------------- | --------------------------------------------- |
| Acurácia aproximada     | **92% – 95%**                                 |
| Taxa de erro aproximada | **5% – 8%**                                   |
| Tempo de processamento  | **até aproximadamente 2 segundos por imagem** |

Os valores correspondem aos testes realizados durante o desenvolvimento e podem variar de acordo com o conjunto de imagens, condições de captura e evolução do modelo.

Por se tratar de um projeto em desenvolvimento, os resultados devem ser considerados **preliminares**.

---

# Validação e Pesquisa

Durante o desenvolvimento do Zenith foram realizadas atividades de pesquisa e aproximação com profissionais e instituições relacionadas ao setor agrícola e tecnológico.

Entre elas:

* visita técnica e imersão na **USP/ESALQ**;
* participação na **Hortitec**, uma das principais feiras do setor agrícola do Brasil;
* reuniões com profissionais de desenvolvimento ligados à **Embrapa**;
* conversas com professores e pesquisadores da **ESALQ**;
* contato com produtores rurais;
* apresentação da proposta a um agricultor interessado no projeto e em sua possível evolução comercial.

Essas experiências auxiliaram na compreensão de necessidades reais do setor e no direcionamento do desenvolvimento da plataforma.

---

# Diferencial do Projeto

O principal diferencial do Zenith está na integração de diferentes ferramentas dentro de um único ambiente digital.

Em vez de trabalhar somente com diagnóstico por Inteligência Artificial ou somente com gerenciamento da propriedade, o projeto busca reunir:

```text
Drones
   +
Inteligência Artificial
   +
Visão Computacional
   +
Fotogrametria
   +
Gestão Agrícola
   +
Dados Climáticos
   ↓
Zenith
```

A proposta é permitir que dados capturados no campo possam ser organizados, processados e visualizados dentro do mesmo ecossistema.

---

# Benefícios Esperados

O desenvolvimento do Zenith busca contribuir para:

* identificação antecipada de problemas na lavoura;
* maior organização das informações agrícolas;
* otimização do monitoramento;
* utilização mais eficiente dos recursos disponíveis;
* redução de processos manuais;
* apoio à tomada de decisões baseada em dados;
* ampliação do acesso à Agricultura de Precisão;
* incentivo ao uso responsável de tecnologias agrícolas;
* desenvolvimento de práticas produtivas mais eficientes e sustentáveis.

---

# Objetivos de Desenvolvimento Sustentável

O projeto apresenta relação com os seguintes **Objetivos de Desenvolvimento Sustentável (ODS)** da Organização das Nações Unidas:

### ODS 2 — Fome Zero e Agricultura Sustentável

Relaciona-se ao desenvolvimento de tecnologias capazes de contribuir para sistemas agrícolas mais produtivos e eficientes.

### ODS 8 — Trabalho Decente e Crescimento Econômico

Relaciona-se ao uso de inovação e tecnologia para apoiar a produtividade e o desenvolvimento econômico no setor agrícola.

### ODS 12 — Consumo e Produção Responsáveis

Relaciona-se à utilização mais eficiente de recursos e ao apoio a práticas de produção mais sustentáveis.

---

# Público-Alvo

O Zenith foi pensado principalmente para **pequenos e médios produtores rurais**, buscando reduzir barreiras relacionadas ao custo e à complexidade de ferramentas avançadas de Agricultura de Precisão.

A arquitetura modular também permite que a solução evolua futuramente para diferentes escalas de propriedade.

---

# Equipe de Desenvolvimento

| Integrante                       |
| -------------------------------- |
| Leonardo Carrilho Macedo         |
| Octavio Augusto Rezende Silva    |
| Pietro De Araujo Mansano Gimenez |
| Samuel Vieira Freitas dos Reis   |

---

# Instituição

**ETEC Polivalente de Americana**

Ensino Médio com Habilitação Profissional de Técnico em Desenvolvimento de Sistemas — AMS

**Ano de desenvolvimento:** 2026

O projeto foi desenvolvido como **Trabalho de Conclusão de Curso (TCC)**.

---

# Status do Projeto

> **Em desenvolvimento**

Atualmente, o Zenith encontra-se em processo de desenvolvimento, validação e aprimoramento de seus módulos.

Entre as principais frentes de evolução estão:

* aprimoramento dos modelos de Inteligência Artificial;
* expansão dos testes com diferentes imagens;
* evolução dos algoritmos de Visão Computacional;
* aperfeiçoamento da reconstrução tridimensional;
* aprimoramento da experiência da plataforma;
* testes práticos com imagens obtidas por drones;
* validação das funcionalidades em cenários agrícolas reais;
* evolução da arquitetura dos serviços.

---

# Estrutura Geral

```text
Zenith
│
├── Plataforma Web / PWA
│   ├── Central de Operações
│   ├── Propriedades
│   ├── Mapas e Talhões
│   ├── Clima
│   ├── Estoque
│   ├── Diário de Campo
│   ├── Atividades
│   └── Equipe
│
├── Inteligência Artificial
│   ├── Diagnóstico de Folhas
│   └── EfficientNetB3
│
├── Visão Computacional
│   ├── Densidade
│   ├── Falhas no Plantio
│   └── Alinhamento de Fileiras
│
├── Processamento 3D
│   ├── Fotogrametria
│   └── WebODM
│
├── APIs
│   └── FastAPI
│
└── Serviços em Nuvem
    ├── Firebase Authentication
    └── Cloud Firestore
```

---

# Aviso

O Zenith é um projeto acadêmico e experimental.

Os diagnósticos, indicadores e demais informações produzidos pela plataforma têm finalidade de **apoio ao monitoramento e à tomada de decisões** e não substituem a avaliação de engenheiros agrônomos, técnicos agrícolas ou outros profissionais habilitados.

---

# Licença

Projeto acadêmico desenvolvido como Trabalho de Conclusão de Curso da **ETEC Polivalente de Americana**.

Todos os direitos reservados aos autores.

---

<p align="center">
  <strong>Zenith</strong><br>
  Sua precisão agrícola no ponto mais alto.
</p>
