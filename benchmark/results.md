# Norix Performance Benchmarking Report

This report lists the performance metrics comparing the Legacy engine and the Modern engine (with Cold and Warm cache runs).

## Individual Repository Metrics

| Repository      | Files | Legacy | Cold Engine | Warm Engine | Cache Hit Rate | Memory | Evidence |
| :-------------- | ----: | -----: | ----------: | ----------: | -------------: | -----: | -------: |
| deploy-app      |    56 |  0.9ms |       3.7ms |       1.0ms |            36% |  5.1MB |        2 |
| docker-app      |    56 |  0.3ms |       1.5ms |       0.6ms |            36% |  5.8MB |        2 |
| express-api     |    56 |  0.4ms |       1.6ms |       0.5ms |            37% |  5.6MB |        1 |
| mongodb-app     |    56 |  0.2ms |       0.8ms |       0.4ms |            38% |  5.3MB |        2 |
| monorepo-pnpm   |    58 |  0.8ms |       1.1ms |       0.7ms |            38% |  6.0MB |        4 |
| monorepo-turbo  |    56 |  0.2ms |       1.0ms |       0.3ms |            37% |  5.8MB |        1 |
| nestjs-api      |    56 |  0.2ms |       0.7ms |       0.3ms |            37% |  6.4MB |        1 |
| nextjs-app      |    56 |  0.2ms |       0.8ms |       0.4ms |            38% |  7.1MB |        2 |
| prisma-postgres |    56 |  0.2ms |       1.0ms |       0.3ms |            38% |  5.8MB |        4 |
| react-vite      |    56 |  0.2ms |       0.8ms |       0.3ms |            38% |  6.4MB |        2 |

## Summary Statistics (Legacy vs Warm Engine)

| Metric                          |                   Value |
| :------------------------------ | ----------------------: |
| **Average Improvement**         |                  -52.8% |
| **Median Improvement**          |                  -47.9% |
| **Best Improvement**            |                   11.8% |
| **Worst Improvement**           |                 -125.5% |
| **95th Percentile Improvement** |                   11.8% |
| **Average Detector Execution**  |                  0.02ms |
| **Slowest Detector**            | docker-compose (0.44ms) |
