from fastapi import FastAPI
from fastapi.responses import FileResponse

from auth.routes import auth_router
from exceptions import register_exceptions
from master.routes import master_router
from menu.routes import menu_router
from middleware.middleware import register_middleware
from out_of_warranty.routes import out_of_warranty_router
from retail.routes import retail_router
from service_center.routes import service_center_router
from service_charge.routes import service_charge_router
from user.routes import user_router
from warranty.routes import warranty_router
from challan.routes_smart import challan_smart_router
from challan.routes_unique import challan_unique_router
from model.routes import model_router
from vendor.routes import vendor_router
from rewinding_rate.routes import rewinding_rate_router

version = "v1"

app = FastAPI(
    version=version,
    title="Smart Enterprise",
    description="Smart Enterprise Management System",
    license_info={"name": "MIT License", "url": "https://opensource.org/license/mit"},
    contact={
        "name": "Sukanya Manna",
        "url": "https://github.com/SM-2102",
        "email": "sukanya.manna.2002@gmail.com",
    },
    openapi_url=f"/openapi.json",
    docs_url=f"/docs",
    redoc_url=f"/redoc",
)


@app.get("/")
def read_root():
    return {
        "title": "Smart Enterprise",
        "description": "Smart Enterprise Management System",
        "version": version,
        "contact": {
            "name": "Sukanya Manna",
            "url": "https://github.com/SM-2102",
            "email": "sukanya.manna.2002@gmail.com",
        },
        "license": {"name": "MIT License", "url": "https://opensource.org/license/mit"},
        "message": "Welcome to Smart Enterprise Management System",
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("favicon.ico")


# Register middleware
register_middleware(app)

# Register exception handlers
register_exceptions(app)

# Routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(menu_router, prefix="/menu", tags=["Menu"])
app.include_router(master_router, prefix="/master", tags=["Master"])
app.include_router(challan_smart_router, prefix="/challan_smart", tags=["Challan - Smart"])
app.include_router(challan_unique_router, prefix="/challan_unique", tags=["Challan - Unique"])
app.include_router(retail_router, prefix="/retail", tags=["Retail"])
app.include_router(warranty_router, prefix="/warranty", tags=["Warranty"])
app.include_router(
    service_center_router, prefix="/service_center", tags=["Service Center"]
)
app.include_router(
    model_router, prefix="/model", tags=["Model"]
)
app.include_router(
    rewinding_rate_router, prefix="/rewinding_rate", tags=["Rewinding Rate"]
)
app.include_router(
    service_charge_router, prefix="/service_charge", tags=["Service Charge"]
)
app.include_router(
    out_of_warranty_router, prefix="/out_of_warranty", tags=["Out of Warranty"]
)
app.include_router(
    vendor_router, prefix="/vendor", tags=["Vendor"]
)
