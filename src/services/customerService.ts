import { customerRepo } from "@/repositories/customerRepo";

export class CustomerService {
    async getAllCustomers() {
        return await customerRepo.findAll();
    }

    async getByPhone(phone: string) {
        return await customerRepo.findByPhone(phone);
    }

    async createCustomer(data: { name: string; phone: string }) {
        return await customerRepo.create({
            name: data.name,
            phone: data.phone,
            points: 0,
            tier: "Silver",
            totalSpent: 0,
        });
    }

    async updateTier(id: string) {
        const customer = await customerRepo.findById(id);
        if (!customer) return;

        let newTier = "Silver";
        if (customer.totalSpent > 5000000) newTier = "Diamond";
        else if (customer.totalSpent > 1000000) newTier = "Gold";

        if (customer.tier !== newTier) {
            await customerRepo.update(id, { tier: newTier });
        }
    }
}

export const customerService = new CustomerService();
