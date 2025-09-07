import { Controller } from "@nestjs/common";
import { OrderTemplateService } from "../orderTemplateService/orderTemplate.service";

@Controller()
export class OrderTemplateController {
    constructor(private orderTemplateService: OrderTemplateService) {}
}