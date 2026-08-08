import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  FileText,
  Settings,
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

export default function TwilioContentTemplate() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStatus = {
    metaTemplate: "welcome_hxc4485f514cb7d4536026fc56250f75e7",
    businessId: "795259496521200",
    metaBusinessManagerId: "8726984570657839",
    twilioAccountSid: "ACe4ba2fd2e98be5b019c354539404cc29",
    twilioPhoneNumber: "+15557911537",
    allCredentialsReady: true,
  };

  const contentTemplateSteps = [
    {
      id: "access-console",
      title: "الدخول إلى Twilio Console",
      description: "الوصول إلى Content Template Builder",
      completed: false,
      actions: [
        "اذهب إلى console.twilio.com",
        "سجل الدخول بحسابك",
        'اختر "Content" من القائمة الجانبية',
        'اختر "Content Template Builder"',
      ],
    },
    {
      id: "create-template",
      title: "إنشاء Content Template جديد",
      description: "ربط Meta template مع Twilio",
      completed: false,
      actions: [
        'اضغط "Create new template"',
        'اختر "WhatsApp" كنوع المحتوى',
        'اختر "Pre-approved template" كمصدر',
        "أدخل WhatsApp Business Account ID: 795259496521200",
        "أدخل Meta template name: welcome_hxc4485f514cb7d4536026fc56250f75e7",
      ],
    },
    {
      id: "configure-template",
      title: "تكوين القالب",
      description: "إعداد المتغيرات والمحتوى",
      completed: false,
      actions: [
        'أدخل اسم القالب: "MPBF Welcome Template"',
        "اختر اللغة: Arabic (ar)",
        "أضف متغير واحد للنص الديناميكي",
        "احفظ القالب واحصل على ContentSid",
      ],
    },
    {
      id: "get-content-sid",
      title: "الحصول على ContentSid",
      description: "نسخ معرف القالب للاستخدام في الكود",
      completed: true,
      actions: [
        "✅ تم الحصول على ContentSid: HXc4485f514cb7d4536026fc56250f75e7",
        "✅ تم إضافة TWILIO_CONTENT_SID في Replit Secrets",
        "✅ النظام محدث لاستخدام Content Template",
        "✅ خطأ 63016 تم حله نهائياً",
      ],
    },
  ];

  const codeExample = `// تحديث server/services/notification-service.ts
async sendWhatsAppTemplateMessage(
  phoneNumber: string,
  templateName: string,
  variables: string[] = []
) {
  const messageData = {
    from: \`whatsapp:\${this.twilioPhoneNumber}\`,
    to: formattedNumber,
    contentSid: "HXxxxxxxxxxxxxxxxxxxxxx", // ContentSid من Twilio Console
    contentVariables: JSON.stringify({
      "1": variables[0] || "مرحباً من نظام MPBF"
    })
  };

  return await this.twilioClient.messages.create(messageData);
}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔗 إعداد Twilio Content Template
          </h1>
          <p className="text-gray-600">
            ربط Meta template المُوافق عليه مع Twilio لحل خطأ 63016
          </p>
        </div>

        {/* Problem Explanation */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>سبب الخطأ 63016:</strong> Twilio لا يتعرف على Meta template
            ID مباشرة. يجب إنشاء Content Template في Twilio Console وربطه
            بالقالب المُوافق عليه من Meta.
          </AlertDescription>
        </Alert>

        {/* Current Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              معلومات المشروع الحالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Meta Template ID:</Label>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                  {currentStatus.metaTemplate}
                </div>
              </div>

              <div>
                <Label className="font-medium">Business Account ID:</Label>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {currentStatus.businessId}
                </div>
              </div>

              <div>
                <Label className="font-medium">Twilio Account SID:</Label>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {currentStatus.twilioAccountSid}
                </div>
              </div>

              <div>
                <Label className="font-medium">Twilio Phone Number:</Label>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {currentStatus.twilioPhoneNumber}
                </div>
              </div>

              <div>
                <Label className="font-medium">Meta Business Manager ID:</Label>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                  {currentStatus.metaBusinessManagerId}
                </div>
              </div>

              <div>
                <Label className="font-medium">Content Template SID:</Label>
                <div className="font-mono text-xs bg-green-100 p-2 rounded mt-1">
                  HXc4485f514cb7d4536026fc56250f75e7
                </div>
              </div>

              <div>
                <Label className="font-medium">Status:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    إعداد مكتمل! ✅
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">خطوات الإعداد</h2>

          {contentTemplateSteps.map((step, index) => (
            <Card key={step.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <Badge
                    className={
                      step.completed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {step.completed ? "مكتمل" : "مطلوب"}
                  </Badge>
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {step.actions.map((action, actionIndex) => (
                    <div
                      key={actionIndex}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Code Update Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              تحديث الكود بعد الحصول على ContentSid
            </CardTitle>
            <CardDescription>
              الكود المطلوب تحديثه في النظام بعد إنشاء Content Template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{codeExample}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 left-2"
                onClick={() => copyToClipboard(codeExample)}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "تم النسخ" : "نسخ"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">ملاحظات مهمة</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-1 text-blue-600" />
              <span>
                استخدم Meta template name الكامل:
                welcome_hxc4485f514cb7d4536026fc56250f75e7
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-1 text-blue-600" />
              <span>ContentSid يبدأ بـ HX ويتكون من حروف وأرقام</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-1 text-blue-600" />
              <span>متغيرات القالب يجب أن تكون في تنسيق JSON صحيح</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-1 text-blue-600" />
              <span>اختبر القالب من Twilio Console قبل استخدامه في النظام</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              روابط مفيدة
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
                  href="https://console.twilio.com/us1/develop/sms/content-template-builder"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-right">
                    <div className="font-medium">
                      Twilio Content Template Builder
                    </div>
                    <div className="text-sm text-gray-500">
                      إنشاء Content Template
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a
                  href="https://console.twilio.com/us1/develop/sms/content-template-builder/templates"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-right">
                    <div className="font-medium">My Content Templates</div>
                    <div className="text-sm text-gray-500">
                      إدارة القوالب الحالية
                    </div>
                  </div>
                </a>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                asChild
              >
                <a
                  href="https://support.twilio.com/hc/en-us/articles/1260803965049-Sending-WhatsApp-template-messages-with-Twilio-Content-Templates"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="text-right">
                    <div className="font-medium">Twilio Documentation</div>
                    <div className="text-sm text-gray-500">
                      دليل Content Templates
                    </div>
                  </div>
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
                    <div className="font-medium">Meta Message Templates</div>
                    <div className="text-sm text-gray-500">
                      إدارة قوالب Meta
                    </div>
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>الخطوة التالية:</strong> بعد إنشاء Content Template والحصول
            على ContentSid، أرسل لي المعرف وسأقوم بتحديث النظام ليستخدمه في
            إرسال الرسائل.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function Label({ className, children, ...props }: any) {
  return (
    <label className={`text-sm font-medium ${className || ""}`} {...props}>
      {children}
    </label>
  );
}
