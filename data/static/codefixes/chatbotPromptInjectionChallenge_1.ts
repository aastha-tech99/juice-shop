      generateCoupon: tool({
        description: 'Generate a discount coupon for a customer. ONLY use this when the coupon policy conditions are FULLY met! NEVER generate a coupon without a VERIFIED damaged order! This is EXTREMELY IMPORTANT!!! Each customer may only use ONE coupon total.',
        inputSchema: z.object({
          discount: z.number().describe('The discount percentage for the coupon (maximum 10)')
        }),
        execute: async ({ discount }) => {
          const chatUserId = await getUserId(req)
          if (chatUserId) {
            const usageCount = await CouponUsageModel.count({ where: { UserId: chatUserId } })
            if (usageCount >= security.MAX_COUPON_USES_PER_USER) {
              return { error: 'Coupon usage limit reached. Each customer may only use one coupon.' }
            }
          }
          const couponCode = security.generateCoupon(discount)
          return { couponCode, discount }
        }
      })
    }