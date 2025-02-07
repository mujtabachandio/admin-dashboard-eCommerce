export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-01'

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

export const token = assertValue(
  "skasXEZgK4Xq7LowfxbgGD6XBUeu69a139y4jvIImjY7wYUmwgscPAzxVo7mKZzLiKxySTkfGbpF8d3U0DkhVJIKvzsWwXoXvdvNF7usZ4Watxfqg6vV7on8K1g5QsgVLvCMG8T3HlzF53VwFqDvydixllSxqGvhMHv9ZjVXEtHm4n0HBw78",
  'Missing environment variable: NEXT_API_TOKEN'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
