import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client?: S3Client;
  private bucket?: string;
  private bucketUrl?: string;

  constructor(private readonly configService: ConfigService) {}

  private ensureConfigured(): void {
    if (this.s3Client && this.bucket && this.bucketUrl) return;

    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new ServiceUnavailableException('AWS config missing');
    }

    this.s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.bucket = bucketName;

    this.bucketUrl = `https://${this.bucket}.s3.${region}.amazonaws.com`;
  }

  // ✅ Upload URL
  async getPresignedUploadUrl(fileName, mimeType, refId, belongsTo) {
    this.ensureConfigured();

    const fileExtension = fileName.split('.').pop();

    const key = `users/${refId}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const url = await getSignedUrl(this.s3Client!, command, {
      expiresIn: 3600,
    });

    return { url, key };
  }

  // ✅ Display image
  getPublicUrl(key: string): string {
    this.ensureConfigured();
    return `${this.bucketUrl}/${key}`;
  }
}