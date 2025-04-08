# Documentação de Acessos ao Sistema BTX Health

Este documento descreve os diferentes perfis de acesso ao sistema BTX Health, seus respectivos usuários e permissões.

## Visão Geral

O sistema possui 7 tipos de perfis de acesso, cada um com permissões específicas para acessar diferentes módulos do sistema:

1. **Médico** - 6 usuários
2. **Recepção** - 6 usuários
3. **Enfermagem** - 6 usuários
4. **Farmácia** - 2 usuários
5. **Financeiro** - 4 usuários
6. **RH** - 4 usuários
7. **Administrador** - 4 usuários

## Acessando a Lista de Usuários

Você pode acessar a lista completa de usuários e suas credenciais na página:
```
/user-access
```

## Credenciais de Acesso

### Médicos
- Dr. Carlos Silva - dr.carlos@btxhealth.com / Med123@BTX
- Dra. Ana Oliveira - dra.ana@btxhealth.com / Med456@BTX
- Dr. Marcos Santos - dr.marcos@btxhealth.com / Med789@BTX
- Dra. Julia Costa - dra.julia@btxhealth.com / Med101@BTX
- Dr. Roberto Almeida - dr.roberto@btxhealth.com / Med202@BTX
- Dra. Camila Ferreira - dra.camila@btxhealth.com / Med303@BTX

### Recepção
- Joana Marques - joana.recep@btxhealth.com / Rec123@BTX
- Pedro Henrique - pedro.recep@btxhealth.com / Rec456@BTX
- Lúcia Mendes - lucia.recep@btxhealth.com / Rec789@BTX
- Fernando Gomes - fernando.recep@btxhealth.com / Rec101@BTX
- Cláudia Lima - claudia.recep@btxhealth.com / Rec202@BTX
- Gabriel Moreira - gabriel.recep@btxhealth.com / Rec303@BTX

### Enfermagem
- Renata Soares - renata.enf@btxhealth.com / Enf123@BTX
- Bruno Dantas - bruno.enf@btxhealth.com / Enf456@BTX
- Carla Vieira - carla.enf@btxhealth.com / Enf789@BTX
- Daniel Torres - daniel.enf@btxhealth.com / Enf101@BTX
- Patrícia Monteiro - patricia.enf@btxhealth.com / Enf202@BTX
- Lucas Pereira - lucas.enf@btxhealth.com / Enf303@BTX

### Farmácia
- Amanda Lopes - amanda.farm@btxhealth.com / Farm123@BTX
- Gustavo Rocha - gustavo.farm@btxhealth.com / Farm456@BTX

### Financeiro
- Mariana Castro - mariana.fin@btxhealth.com / Fin123@BTX
- Rafael Andrade - rafael.fin@btxhealth.com / Fin456@BTX
- Luiza Moraes - luiza.fin@btxhealth.com / Fin789@BTX
- Vitor Garcia - vitor.fin@btxhealth.com / Fin101@BTX

### RH
- Beatriz Dias - beatriz.rh@btxhealth.com / RH123@BTX
- Henrique Nunes - henrique.rh@btxhealth.com / RH456@BTX
- Vanessa Cardoso - vanessa.rh@btxhealth.com / RH789@BTX
- Thiago Brito - thiago.rh@btxhealth.com / RH101@BTX

### Administradores
- Paula Ribeiro - paula.admin@btxhealth.com / Admin123@BTX
- André Martins - andre.admin@btxhealth.com / Admin456@BTX
- Cristina Duarte - cristina.admin@btxhealth.com / Admin789@BTX
- Marcelo Freitas - marcelo.admin@btxhealth.com / Admin101@BTX

## Permissões por Perfil

### Médico
- Acesso ao Consultório Médico
- Visualização e edição de prontuários
- Prescrição de medicamentos
- Solicitação de exames
- Visualização de relatórios básicos

### Recepção
- Cadastro de pacientes
- Gerenciamento da fila de atendimento
- Marcação de consultas
- Visualização básica de pacientes

### Enfermagem
- Triagem de pacientes
- Classificação de risco
- Medição de sinais vitais
- Registro de procedimentos básicos

### Farmácia
- Dispensação de medicamentos
- Controle de estoque
- Visualização de prescrições

### Financeiro
- Gestão financeira
- Faturamento
- Processamento de pagamentos
- Relatórios financeiros

### RH
- Gestão de funcionários
- Folha de pagamento
- Benefícios
- Recrutamento

### Administrador
- Acesso completo ao sistema
- Configurações gerais
- Gerenciamento de usuários
- Geração de relatórios avançados
- Backups e manutenção

## Integração com o Sistema

O sistema de autenticação e autorização foi implementado utilizando:

1. **Controle de Acesso por Papel (RBAC)** - Cada usuário possui um papel específico que determina suas permissões
2. **Permissões Granulares** - Cada módulo do sistema possui permissões específicas
3. **Componente de Controle de Acesso** - O componente `AccessControl` verifica as permissões do usuário
4. **Rotas Protegidas** - Apenas usuários autorizados podem acessar determinadas rotas

## Atualização de Acessos

Para modificar os acessos, edite os arquivos:
- `src/data/users.ts` - Para adicionar/remover usuários
- `src/data/permissions.ts` - Para modificar permissões

## Suporte e Problemas de Acesso

Em caso de problemas de acesso, contate um administrador do sistema ou consulte a documentação técnica. 