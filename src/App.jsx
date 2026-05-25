import { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import { TooltipComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([MapChart, TooltipComponent, VisualMapComponent, CanvasRenderer]);

const GIST_ID = import.meta.env.VITE_GIST_ID || 'c2a482e1a74452d4d09c324ef6d79c0a';
const GIST_FILE_NAME = import.meta.env.VITE_GIST_FILE_NAME || 'usermap.json';
const GITHUB_API_BASE = 'https://api.github.com/gists';

const PROVINCES = [
  '北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南',
  '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾',
  '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门',
];

const PIECEWISE = [
  { min: 12, label: '12+', color: '#0a3d91' },
  { min: 6, max: 11, label: '6-11', color: '#3978d8' },
  { min: 3, max: 5, label: '3-5', color: '#79a4f5' },
  { min: 1, max: 2, label: '1-2', color: '#bdd4ff' },
  { value: 0, label: '0', color: '#f0f4ff' },
];

function App() {
  const [province, setProvince] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  function gistHeaders(needsAuth = false, token = '') {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (needsAuth && token) {
      headers.Authorization = `token ${token}`;
    }
    return headers;
  }

  async function loadGist() {
    if (!GIST_ID) {
      throw new Error('请在 VITE_GIST_ID 环境变量中配置 Gist ID。');
    }
    const response = await fetch(`${GITHUB_API_BASE}/${GIST_ID}`, {
      headers: gistHeaders(),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gist 读取失败：${response.status} ${body}`);
    }
    return response.json();
  }

  async function loadSubmissions() {
    const gist = await loadGist();
    const file = gist.files?.[GIST_FILE_NAME];
    if (!file?.content) {
      return [];
    }
    const parsed = JSON.parse(file.content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (Array.isArray(parsed.submissions)) {
      return parsed.submissions;
    }
    return [];
  }

  async function saveSubmissions(submissions, token) {
    const authToken = token?.trim();
    if (!authToken) {
      throw new Error('写入 Gist 需要 GitHub 访问令牌。请在页面中输入您的令牌。');
    }
    const content = JSON.stringify({ submissions }, null, 2);
    const response = await fetch(`${GITHUB_API_BASE}/${GIST_ID}`, {
      method: 'PATCH',
      headers: gistHeaders(true, authToken),
      body: JSON.stringify({ files: { [GIST_FILE_NAME]: { content } } }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gist 更新失败：${response.status} ${body}`);
    }
    return response.json();
  }

  useEffect(() => {
    fetchSubmissions();

    async function loadChinaMap() {
      const cdnUrls = [
        'https://unpkg.com/echarts@5.4.2/map/json/china.json',
        'https://cdn.jsdelivr.net/npm/echarts@5.4.2/map/json/china.json',
      ];

      for (const url of cdnUrls) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            continue;
          }
          const geoJson = await response.json();
          echarts.registerMap('china', geoJson);
          setMapLoaded(true);
          return;
        } catch (error) {
          // Try next CDN
        }
      }

      setError('地图加载失败，请检查网络连接或更换 CDN。');
    }

    loadChinaMap();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    setError('');
    try {
      const data = await loadSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const provinceCounts = useMemo(() => {
    const counts = PROVINCES.reduce((acc, item) => ({ ...acc, [item]: 0 }), {});
    submissions.forEach((entry) => {
      if (entry.province && counts[entry.province] !== undefined) {
        counts[entry.province] += 1;
      }
    });
    return counts;
  }, [submissions]);

  const chartData = useMemo(
    () => PROVINCES.map((name) => ({ name, value: provinceCounts[name] || 0 })),
    [provinceCounts]
  );

  const chartOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: ({ name, value }) => `${name}<br/>用户数量：${value || 0}`,
      },
      visualMap: {
        type: 'piecewise',
        pieces: PIECEWISE,
        left: 'left',
        top: 'middle',
        orient: 'vertical',
        textStyle: { color: '#222' },
      },
      series: [
        {
          name: '省份用户数',
          type: 'map',
          map: 'china',
          roam: false,
          label: { show: false },
          emphasis: {
            itemStyle: { areaColor: '#f3b23a' },
            label: { show: true, color: '#000' },
          },
          data: chartData,
        },
      ],
    }),
    [chartData]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (!province) {
      setMessage('请选择一个省份');
      return;
    }
    setMessage('');
    try {
      setLoading(true);
      const submissions = await loadSubmissions();
      const newEntry = {
        id: `${Date.now()}`,
        province,
        createdAt: new Date().toISOString(),
      };
      submissions.push(newEntry);
      await saveSubmissions(submissions, githubToken);
      setProvince('');
      setMessage('提交成功，地图已更新');
      setShowMap(true);
      fetchSubmissions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSeeMap() {
    setShowMap(true);
    fetchSubmissions();
  }

  const sortedItems = useMemo(
    () => [...PROVINCES].sort((a, b) => provinceCounts[b] - provinceCounts[a]),
    [provinceCounts]
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">中国省份地图统计</p>
          <h1>基于省份提交数量着色的地图</h1>
          <p>用户选择中国省份后，系统会使用 GitHub Gist 存储数据，并为每个省份渲染不同颜色。</p>
        </div>
        <button type="button" className="outline-button" onClick={handleSeeMap}>
          查看地图
        </button>
      </header>

      <main className="content-grid">
        <section className="panel form-panel">
          <h2>提交省份</h2>
          <form onSubmit={handleSubmit}>
            <label>
              省份
              <select value={province} onChange={(event) => setProvince(event.target.value)} required>
                <option value="">请选择省份</option>
                {PROVINCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <div className="actions-row">
              <button type="submit" disabled={loading}>
                提交省份
              </button>
            </div>
          </form>
          <div className="notes">
            <p>省份名称为中文列表。提交后数据会直接写入 GitHub Gist。</p>
            <p>“查看地图”按钮可在不提交数据的情况下直接查看当前统计。</p>
            <p>要提交数据，请在页面中输入您的 GitHub 访问令牌。</p>
          </div>
          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}
        </section>

        <section className="panel map-panel">
          <h2>中国省份热力图</h2>
          {showMap ? (
            mapLoaded ? (
              <ReactECharts echarts={echarts} option={chartOption} style={{ height: '520px', width: '100%' }} />
            ) : (
              <div className="placeholder">地图数据加载中，请稍候...</div>
            )
          ) : (
            <div className="placeholder">点击“查看地图”或先提交省份，地图将在此显示。</div>
          )}
        </section>

        <aside className="panel summary-panel">
          <h2>统计摘要</h2>
          <div className="summary-item">
            <span>总提交数</span>
            <strong>{submissions.length}</strong>
          </div>
          <div className="summary-list">
            {sortedItems.slice(0, 8).map((name) => (
              <div key={name} className="summary-row">
                <span>{name}</span>
                <strong>{provinceCounts[name]}</strong>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
