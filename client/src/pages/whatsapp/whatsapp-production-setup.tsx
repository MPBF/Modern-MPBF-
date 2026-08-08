import {
  CheckCircle,
  ExternalLink,
  Settings,
  Phone,
  MessageSquare,
  Shield,
  ArrowRight,
  Copy,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useToast } from "../../hooks/use-toast";

export default function WhatsAppProductionSetup() {
  const { toast } = useToast();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId],
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص إلى الحافظة",
    });
  };

  const webhookUrl = `${window.location.origin}/api/notifications/webhook/twilio`;

  const productionSteps = [
    {
      id: "meta-business-setup",
      title: "إعداد Meta Business Manager",
      description: "تأكد من إعداد WhatsApp Business Account بشكل صحيح",
      category: "Meta Setup",
      steps: [
        "اذهب إلى Meta Business Manager (business.facebook.com)",
        "اختر WhatsApp من القائمة الجانبية",
        "تأكد أن WhatsApp Business Account ID: 795259496521200 مُفعل",
        'تحقق من أن Display Name "MPBF" مُوافق عليه',
        "تأكد من تفعيل رقم +15557911537 بالكامل",
      ],
      important: true,
    },
    {
      id: "message-templates",
      title: "إنشاء قوالب الرسائل",
      description: "إنشاء والموافقة على قوالب الرسائل المطلوبة",
      category: "Templates",
      steps: [
        "اذهب إلى WhatsApp → Message Templates في Meta Business Manager",
        'أنشئ قالب "hello_world" الأساسي للاختبار',
        "أنشئ قوالب مخصصة لنظامك (إشعارات، تذكيرات، إلخ)",
        "انتظر الموافقة على القوالب (قد يستغرق 24-48 ساعة)",
        'تأكد من حالة "APPROVED" لجميع القوالب',
      ],
      templates: [
        {
          name: "hello_world",
          content: "Hello {{1}}, your appointment is confirmed.",
          language: "en",
        },
        {
          name: "system_notification_ar",
          content: "مرحباً {{1}}، لديك إشعار جديد من نظام MPBF: {{2}}",
          language: "ar",
        },
        {
          name: "order_status_ar",
          content: "تحديث الطلب رقم {{1}}: {{2}}. شكراً لك.",
          language: "ar",
        },
      ],
    },
    {
      id: "twilio-production",
      title: "تفعيل Production في Twilio",
      description: "ربط WhatsApp Business Account مع Twilio",
      category: "Twilio Setup",
      steps: [
        "اذهب إلى Twilio Console → Messaging → WhatsApp senders",
        'اختر "Connect a WhatsApp Business Account"',
        "أدخل Business Account ID: 795259496521200",
        "اتبع خطوات التحقق والربط",
        "تأكد من ظهور الرقم +15557911537 في قائمة Connected Numbers",
      ],
    },
    {
      id: "webhook-configuration",
      title: "إعداد Webhook",
      description: "تكوين endpoints لاستقبال الرسائل والتحديثات",
      category: "Integration",
      steps: [
        "في Twilio Console، اختر رقم WhatsApp المُفعل",
        "اذهب إلى Configuration → Webhooks",
        `أدخل Webhook URL: ${webhookUrl}`,
        "اختر HTTP Method: POST",
        'فعل "When a message comes in" و "Status callback"',
        "احفظ الإعدادات واختبر الاتصال",
      ],
    },
    {
      id: "permissions-verification",
      title: "التحقق من الصلاحيات",
      description: "تأكد من جميع الصلاحيات والموافقات المطلوبة",
      category: "Verification",
      steps: [
        "تحقق من Business Verification في Meta Business Manager",
        "تأكد من Payment Method مُضاف ومُفعل",
        "تحقق من Message Limits (عدد الرسائل المسموح)",
        "تأكد من Quality Rating للحساب",
        "تحقق من Compliance مع WhatsApp Policies",
      ],
    },
    {
      id: "system-integration",
      title: "تحديث النظام",
      description: "تحديث النظام لاستخدام Production templates",
      category: "System Update",
      steps: [
        "تحديث notification service لاستخدام approved templates",
        "إضافة معالجة أخطاء production-specific",
        "تحديث message formatting للقوالب المُوافق عليها",
        "إعداد rate limiting حسب WhatsApp limits",
        "تفعيل production logging ومراقبة",
      ],
    },
  ];

  const accountInfo = {
    businessAccountId: "795259496521200",
    businessManagerId: "8726984570657839",
    whatsappNumber: "+15557911537",
    displayName: "MPBF",
    twilioAccountSid: "ACe4ba2fd2e98be5b019c354539404cc29",
  };

  const getStepIcon = (stepId: string) => {
    return completedSteps.includes(stepId) ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
    );
  };

  const completedCount = completedSteps.length;
  const totalSteps = productionSteps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 إعداد WhatsApp Production Mode
          </h1>
          <p className="text-gray-600">
            دليل شامل لتفعيل WhatsApp Business في وضع الإنتاج
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                التقدم الإجمالي
              </span>
              <span className="text-sm text-gray-500">
                {completedCount} من {totalSteps}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              معلومات الحساب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Business Account ID:
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {accountInfo.businessAccountId}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(accountInfo.businessAccountId)
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Business Manager ID:
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {accountInfo.businessManagerId}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(accountInfo.businessManagerId)
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    WhatsApp Number:
                  </span>
                  <Badge variant="outline">{accountInfo.whatsappNumber}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Display Name:</span>
                  <Badge variant="outline">{accountInfo.displayName}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Twilio Account:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {accountInfo.twilioAccountSid}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Webhook URL:</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs max-w-[200px] truncate"
                    >
                      {webhookUrl}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(webhookUrl)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>مهم:</strong> في Production Mode، يجب الحصول على موافقة Meta
            على جميع قوالب الرسائل قبل الإرسال. عملية الموافقة قد تستغرق 24-48
            ساعة.
          </AlertDescription>
        </Alert>

        {/* Setup Steps */}
        <div className="space-y-4">
          {productionSteps.map((step, index) => (
            <Card
              key={step.id}
              className={`${step.important ? "border-blue-200 bg-blue-50" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="flex-shrink-0"
                    >
                      {getStepIcon(step.id)}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>
                          الخطوة {index + 1}: {step.title}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {step.category}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {step.description}
                      </CardDescription>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {step.steps.map((stepText, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="text-blue-500 mt-1 flex-shrink-0">
                        {stepIndex + 1}.
                      </span>
                      <span className="text-gray-700">{stepText}</span>
                    </div>
                  ))}
                </div>

                {/* Templates for message templates step */}
                {step.id === "message-templates" &&
                  "templates" in step &&
                  step.templates && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-gray-900">
                        قوالب الرسائل المقترحة:
                      </h4>
                      {step.templates.map((template, templateIndex) => (
                        <div
                          key={templateIndex}
                          className="bg-white p-3 rounded border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                              {template.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {template.language === "ar" ? "عربي" : "إنجليزي"}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
                            {template.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              روابط سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a
                  href="https://business.facebook.com/wa/manage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-right">
                    <div className="font-medium">Meta Business Manager</div>
                    <div className="text-sm text-gray-500">
                      إدارة WhatsApp Business Account
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 mr-2" />
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a
                  href="https://console.twilio.com/us1/develop/sms/senders/whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-right">
                    <div className="font-medium">Twilio WhatsApp Console</div>
                    <div className="text-sm text-gray-500">
                      إدارة أرقام WhatsApp
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 mr-2" />
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a
                  href="https://business.facebook.com/wa/manage/message-templates/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-right">
                    <div className="font-medium">Message Templates</div>
                    <div className="text-sm text-gray-500">
                      إدارة قوالب الرسائل
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 mr-2" />
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a
                  href="https://business.facebook.com/settings/business-verification"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-right">
                    <div className="font-medium">Business Verification</div>
                    <div className="text-sm text-gray-500">
                      التحقق من الأعمال
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 mr-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {completedCount === totalSteps && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700">
                🎉 إعداد Production مكتمل!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-3">
                أحسنت! أكملت جميع خطوات إعداد Production Mode.
              </p>
              <div className="space-y-2 text-sm text-green-600">
                <p>• يمكنك الآن إرسال رسائل إلى أي رقم WhatsApp مُسجل</p>
                <p>• تأكد من استخدام القوالب المُوافق عليها فقط</p>
                <p>• راقب Message Limits و Quality Rating</p>
                <p>• اختبر النظام مع أرقام حقيقية</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
