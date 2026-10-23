---
name: microservices-saga-pattern
description: Implementa el patrón Saga para mantener la consistencia entre microservicios sin transacciones distribuidas.
---

# Patrón Saga para Microservicios

## Objetivo
Mantener la consistencia de datos entre servicios cuando una operación afecta a varios
(ej. cerrar una queja en MP requiere descontar materiales en Materials Service).

## Proceso

1. **Identifica la operación distribuida** (ej. "cerrar queja" → "descontar materiales").

2. **Elige el tipo de Saga:**
   - **Coreografía:** cada servicio publica eventos y los demás reaccionan. Simple,
     pero difícil de seguir.
   - **Orquestación:** un servicio coordinador dirige la saga. Más complejo, pero
     el flujo es explícito.

3. **Para tu caso (MP + Materials), usa orquestación:** MP llama a Materials,
   y si falla, MP compensa (revierte el cambio de estado).

4. **Implementa la compensación:**
   ```typescript
   // En MP, al cerrar queja
   async function cerrarQueja(quejaId, materiales) {
       // 1. Cambiar estado en MP
       await updateQuejaEstado(quejaId, 'cerrada');

       // 2. Llamar a Materials para descontar
       try {
           await fetch(`${MATERIALS_URL}/api/materiales/consumo`, {
               method: 'POST',
               body: JSON.stringify({ quejaId, materiales })
           });
       } catch (error) {
           // 3. Compensar: revertir el estado
           await updateQuejaEstado(quejaId, 'resuelta');
           throw new Error('No se pudo descontar materiales');
       }
   }

5. Verifica que la compensación funciona simulando un fallo en Materials.

**Verificación**
- Si Materials falla, MP revierte el estado.
- Si Materials responde, el estado se mantiene.
- No hay estados intermedios inconsistentes.