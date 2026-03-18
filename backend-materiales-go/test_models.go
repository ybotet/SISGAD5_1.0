package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

func main() {
    // Crear un material de ejemplo
    material := models.Material{
        ID:          1,
        Codigo:      "RT-100",
        Nombre:      "Router X100",
        Descripcion: "Router WiFi 6",
        Categoria:   "Router",
        Unidad:      "unidad",
        Precio:      89.99,
        CreatedAt:   time.Now(),
    }
    
    // Convertir a JSON
    jsonData, _ := json.MarshalIndent(material, "", "  ")
    fmt.Println(string(jsonData))
    
    // Crear una asignación de ejemplo
    asignacion := models.Asignacion{
        ID:             1,
        IDTrabajador:   123,
        FechaAsignacion: time.Now(),
        Observaciones:  "Para trabajo de instalación",
        Detalles: []models.AsignacionDetalle{
            {
                IDMaterial:    1,
                Cantidad:      2,
                CostoUnitario: 89.99,
            },
        },
    }
    
    jsonData2, _ := json.MarshalIndent(asignacion, "", "  ")
    fmt.Println(string(jsonData2))
}