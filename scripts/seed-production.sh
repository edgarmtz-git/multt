#!/bin/bash

echo "🌱 Seeding production database..."
echo ""
echo "This will create:"
echo "  - Admin user: admin@sistema.com / admin123"
echo "  - Client user: cliente@empresa.com / cliente123"
echo "  - Store: La Casa del Sabor (slug: lacasadelsabor)"
echo "  - 1 Category: Pizzas"
echo "  - 1 Product: Pizza Margarita with variants and options"
echo ""
echo "⚠️  This can only be run ONCE. If users already exist, it will fail."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "📡 Calling seed endpoint..."

    RESPONSE=$(curl -s -X POST https://multt.vercel.app/api/setup/seed)

    echo ""
    echo "📋 Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""

    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "✅ Database seeded successfully!"
        echo ""
        echo "🔗 Test URLs:"
        echo "   Store: https://multt.vercel.app/tienda/lacasadelsabor"
        echo "   Login: https://multt.vercel.app/login"
        echo ""
    else
        echo "❌ Seed failed. Check the response above."
    fi
else
    echo "Cancelled."
fi
