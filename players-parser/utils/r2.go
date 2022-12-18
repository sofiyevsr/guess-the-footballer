package utils

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var client *s3.Client
var bucketName, accountId, accessKeyId, accessKeySecret string

func InitializeR2() {
	accountId = os.Getenv("CLOUDFLARE_ACCOUNT_ID")
	bucketName = os.Getenv("R2_BUCKET_NAME")
	accessKeyId = os.Getenv("R2_ACCESS_KEY")
	accessKeySecret = os.Getenv("R2_SECRET_KEY")

	r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL: fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountId),
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(r2Resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyId, accessKeySecret, "")),
	)
	if err != nil {
		log.Fatal(err)
	}

	client = s3.NewFromConfig(cfg)
}

func DownloadAndUploadImage(url string, filename string) error {
	if client == nil {
		log.Fatal("S3 client is not initialized")
	}

	if strings.TrimSpace(url) == "" {
		return nil
	}
	response, err := http.Get(url)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		return errors.New(fmt.Sprintf("Received error with status %d", response.StatusCode))
	}

	contentType := response.Header.Get("Content-Type")

	_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(bucketName),
		Key:           aws.String(filename),
		Body:          response.Body,
		ContentLength: response.ContentLength,
		ContentType:   &contentType,
	})

	if err != nil {
		return errors.New(
			fmt.Sprintf("Couldn't upload file %v to %v. Here's why: %v\n", filename, bucketName, err),
		)
	}
	return nil
}
