import { Query, Resolver } from '@nestjs/graphql';
import { ReportService } from 'src/services/Report.service';

@Resolver(() => Report)
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @Query(() => [Report])
  async reports() {
    return this.reportService.getReports();
  }
}
