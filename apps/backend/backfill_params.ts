import prisma from './src/utils/prisma';

const paramTemplates = {
  'Complete Blood Count (CBC)': [
    { parameterName: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0' },
    { parameterName: 'Red Blood Cell Count', value: '4.8', unit: 'mill/cmm', referenceRange: '4.5 - 5.5' },
    { parameterName: 'White Blood Cell Count', value: '7,200', unit: '/cmm', referenceRange: '4,000 - 11,000' },
    { parameterName: 'Platelet Count', value: '245', unit: '10³/µL', referenceRange: '150 - 450' },
  ],
  'Lipid Profile': [
    { parameterName: 'Total Cholesterol', value: '185', unit: 'mg/dL', referenceRange: '< 200' },
    { parameterName: 'Triglycerides', value: '140', unit: 'mg/dL', referenceRange: '< 150' },
    { parameterName: 'HDL Cholesterol', value: '55', unit: 'mg/dL', referenceRange: '> 40' },
    { parameterName: 'LDL Cholesterol', value: '110', unit: 'mg/dL', referenceRange: '< 130' },
  ],
  'Thyroid Profile (T3, T4, TSH)': [
    { parameterName: 'Free T3', value: '3.2', unit: 'pg/mL', referenceRange: '2.0 - 4.4' },
    { parameterName: 'Free T4', value: '1.4', unit: 'ng/dL', referenceRange: '0.8 - 2.0' },
    { parameterName: 'TSH', value: '2.1', unit: 'µIU/mL', referenceRange: '0.4 - 4.0' },
  ],
  'HbA1c': [
    { parameterName: 'HbA1c', value: '5.4', unit: '%', referenceRange: '< 5.7' },
    { parameterName: 'Estimated Average Glucose', value: '108', unit: 'mg/dL', referenceRange: '97 - 114' },
  ],
  'Default': [
    { parameterName: 'Observation', value: 'Normal', unit: '-', referenceRange: 'Normal' },
    { parameterName: 'Clinical Notes', value: 'No abnormalities detected', unit: '-', referenceRange: '-' },
  ]
};

async function main() {
  const orders = await prisma.labOrder.findMany({
    include: { tests: { include: { labTest: true } } }
  });

  for (const order of orders) {
    if (order.tests.length === 0) continue;
    
    const testName = order.tests[0].labTest.name;
    const template = paramTemplates[testName as keyof typeof paramTemplates] || paramTemplates['Default'];

    // Randomize values slightly for realism
    for (const t of template) {
      let val = t.value;
      if (t.parameterName === 'Hemoglobin (Hb)') val = (13 + Math.random() * 4).toFixed(1);
      if (t.parameterName === 'Total Cholesterol') val = Math.floor(150 + Math.random() * 80).toString();
      if (t.parameterName === 'TSH') val = (0.5 + Math.random() * 3.5).toFixed(1);

      await prisma.reportParameter.create({
        data: {
          labOrderId: order.id,
          parameterName: t.parameterName,
          value: val,
          unit: t.unit,
          referenceRange: t.referenceRange
        }
      });
    }
  }
  
  console.log(`Backfilled parameters for ${orders.length} orders.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
