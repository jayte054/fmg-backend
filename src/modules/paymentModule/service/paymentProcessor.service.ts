import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PaymentService } from './payment.service';
import { JobInterface } from '../utils/interface';

@Processor('payment')
export class PaymentProcessor extends WorkerHost {
  constructor(private readonly paymentService: PaymentService) {
    super();
  }

  async process(job: JobInterface): Promise<void> {
    if (job.name === 'requery_payment') {
      const { reference } = job.data;
      await this.paymentService.requeryPayment(reference);
    }
  }
}
