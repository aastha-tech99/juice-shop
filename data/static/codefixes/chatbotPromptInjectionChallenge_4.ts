      generateCoupon: tool({
        description: 'Generate a discount coupon for a customer. Only use this when the coupon policy conditions are fully met. Each customer may only use ONE coupon total.',
        inputSchema: z.object({
          discount: z.number().describe('The discount percentage for the coupon (maximum 10)'),
          reason: z.string().describe('The reason for generating this coupon, must reference the damaged order ID')
        }),
        execute: async ({ discount, reason }) => {
          const chatUserId = await getUserId(req)
          if (chatUserId) {
            const usageCount = await CouponUsageModel.count({ where: { UserId: chatUserId } })
            if (usageCount >= security.MAX_COUPON_USES_PER_USER) {
              return { error: 'Coupon usage limit reached. Each customer may only use one coupon.' }
            }
          }
          const orderIdPattern = /[0-9a-f]{4}-[0-9a-f]{16}/
          if (!orderIdPattern.test(reason)) {
            return { error: 'Reason must reference a valid order ID.' }
          }
          const couponCode = security.generateCoupon(discount)
          return { couponCode, discount }
        }
      })
    }