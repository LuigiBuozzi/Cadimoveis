<?php

namespace App\Support;

/**
 * Reads PHP's upload limits so the frontend can warn before sending files
 * that the server would reject.
 */
class UploadLimits
{
    /**
     * The largest file PHP accepts, in bytes.
     */
    public static function maxFileSize(): int
    {
        return self::toBytes((string) ini_get('upload_max_filesize'));
    }

    /**
     * The largest request body PHP accepts, in bytes.
     */
    public static function maxPostSize(): int
    {
        return self::toBytes((string) ini_get('post_max_size'));
    }

    /**
     * The largest file PHP accepts, in kilobytes, for the "max" validation rule.
     */
    public static function maxFileSizeInKilobytes(): int
    {
        return intdiv(self::maxFileSize(), 1024);
    }

    /**
     * @return array{maxFileSize: int, maxPostSize: int}
     */
    public static function toArray(): array
    {
        return [
            'maxFileSize' => self::maxFileSize(),
            'maxPostSize' => self::maxPostSize(),
        ];
    }

    /**
     * Converts php.ini sizes such as "2M" or "1G" to bytes.
     */
    private static function toBytes(string $value): int
    {
        $value = trim($value);
        $number = (int) $value;

        return match (strtoupper(substr($value, -1))) {
            'G' => $number * 1024 ** 3,
            'M' => $number * 1024 ** 2,
            'K' => $number * 1024,
            default => $number,
        };
    }
}
