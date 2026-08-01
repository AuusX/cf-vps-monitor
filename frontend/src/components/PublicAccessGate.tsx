import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Flex, Heading, IconButton, Text, TextField } from '@radix-ui/themes';
import { Eye, EyeOff, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

type AccessState = 'loading' | 'allowed' | 'locked' | 'error';

type AccessStatus = {
  password_required?: boolean;
  authenticated?: boolean;
};

export default function PublicAccessGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth();
  const [accessState, setAccessState] = useState<AccessState>('loading');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusRequest, setStatusRequest] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) {
      setAccessState('allowed');
      return;
    }

    let cancelled = false;
    setAccessState('loading');
    fetch('/api/access/status', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as AccessStatus;
        if (!response.ok) throw new Error('无法检查访问状态');
        return data;
      })
      .then((data) => {
        if (!cancelled) setAccessState(data.password_required && !data.authenticated ? 'locked' : 'allowed');
      })
      .catch(() => {
        if (!cancelled) setAccessState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, statusRequest]);

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/access/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setError(data.error || '访问密码错误');
        return;
      }
      setPassword('');
      setAccessState('allowed');
    } catch {
      setError('请求失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || accessState === 'loading') return <Loading fullScreen />;
  if (accessState === 'allowed') return <>{children}</>;

  return (
    <div className="login-page">
      <Card className="login-card" style={{ padding: '36px 32px' }}>
        <Flex direction="column" align="center" gap="2" mb="5">
          <Box className="login-logo">
            <img src="/app-icon.png" alt="" />
          </Box>
          <Heading size="6" style={{ fontSize: '1.5rem', letterSpacing: '0', fontWeight: 700 }}>
            访问验证
          </Heading>
          <Text size="2" color="gray">CF VPS Monitor</Text>
        </Flex>

        {accessState === 'error' ? (
          <Flex direction="column" align="center" gap="4">
            <Text size="2" color="red">无法检查访问状态</Text>
            <Button variant="soft" onClick={() => setStatusRequest((value) => value + 1)}>
              <RefreshCw size={16} /> 重试
            </Button>
          </Flex>
        ) : (
          <form onSubmit={submitPassword}>
            <Flex direction="column" gap="4">
              <label htmlFor="public-access-password">
                <Text size="2" weight="bold" style={{ display: 'inline-block', marginBottom: 6 }}>
                  访问密码
                </Text>
                <TextField.Root
                  id="public-access-password"
                  size="3"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  autoFocus
                >
                  <TextField.Slot><KeyRound size={17} /></TextField.Slot>
                  <TextField.Slot side="right">
                    <IconButton
                      type="button"
                      size="1"
                      variant="ghost"
                      aria-label={showPassword ? '隐藏密码' : '显示密码'}
                      title={showPassword ? '隐藏密码' : '显示密码'}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </label>
              {error && <Text size="2" color="red">{error}</Text>}
              <Button type="submit" size="3" disabled={!password || submitting}>
                <KeyRound size={17} /> {submitting ? '验证中...' : '进入面板'}
              </Button>
              <Button asChild type="button" size="2" variant="ghost" color="gray">
                <Link to="/admin/login"><ShieldCheck size={16} /> 管理员登录</Link>
              </Button>
            </Flex>
          </form>
        )}
      </Card>
    </div>
  );
}
